import axios from 'axios'
import dotenv from 'dotenv'
import NodeCache from 'node-cache'
import { load } from 'cheerio'
import { decode } from 'html-entities'
import { XMLParser } from "fast-xml-parser"
import pLimit from 'p-limit'
import sendMail from './smtpController.js'
import { deepFixMojibake } from '../helpers/fixMojibake.js'
const cache = new NodeCache({ stdTTL: 0 })
const limit = pLimit(5)
dotenv.config()

let cachedToken = null
let tokenExpiryTime = null

const fetchToken = async () => {
  try {
    const response = await axios.post(
      'https://api.webmegler.no/oauth/connect/token',
      {
        grant_type: 'client_credentials',
        client_id: process.env.WEBMEGLER_CLIENT_ID,
        client_secret: process.env.WEBMEGLER_CLIENT_SECRET,
      },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    cachedToken = response.data.access_token
    tokenExpiryTime = Date.now() + 59 * 60 * 1000 // 59 minutes
    console.log('New Token Generated', cachedToken)
    return cachedToken
  } catch (error) {
    console.log('ERROR', error.response)
    throw new Error('Token Generation Failed')
  }
}

const getToken = async () => {
  if (!cachedToken || Date.now() >= tokenExpiryTime) return await fetchToken()
  return cachedToken
}

const createToken = async (req, res) => {
  try {
    const token = await getToken()
    return res.status(200).json({ message: 'Token Created', token })
  } catch (error) {
    console.log('ERROR', error.response)
    return res.status(500).json({
      message: 'Token Creation Failed',
      error: error?.response?.data?.error,
    })
  }
}

const getCompanies = async (req, res) => {
  try {
    const { tenantId } = req.query
    const { companyId } = req.params
    if (!tenantId) {
      return res.status(400).json({
        message: 'Missing Required Fields',
      })
    }

    const token = await getToken()
    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    const baseUrl = `https://api.webmegler.no/app/${tenantId}/1.0/firma`
    const url = companyId ? `${baseUrl}/${companyId}` : baseUrl

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    return res.status(200).json({ message: companyId ? 'Company Listed' : 'Companies Listed', data: response.data })
  } catch (error) {
    console.log('ERROR', error.response)
    return res.status(500).json({
      message: 'Companies Listed Failed',
      error: error?.response?.data?.error || error?.response?.statusText,
    })
  }
}

const getDepartments = async (req, res) => {
  try {
    const { tenantId, companyId } = req.query
    const { departmentId } = req.params
    if (!tenantId) {
      return res.status(400).json({
        message: 'Missing Required Fields',
      })
    }

    const token = await getToken()
    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }
    console.log('TOKEN', token)

    const baseUrl = `https://api.webmegler.no/app/${tenantId}/1.0/`
    const url = departmentId ? `${baseUrl}/avdelinger/${departmentId}` : `${baseUrl}/firma/${companyId}/avdelinger`
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    return res
      .status(200)
      .json({ message: departmentId ? 'Department Listed' : 'Departments Listed', data: response.data })
  } catch (error) {
    console.log('ERROR', error.response)
    return res.status(500).json({
      message: 'Departments Listed Failed',
      error: error?.response?.data?.error || error?.response?.statusText,
    })
  }
}

const getEmployees = async (req, res) => {
  try {
    const { tenantId, departmentId } = req.query
    const { employeeId } = req.params
    if (!tenantId) {
      return res.status(400).json({
        message: 'Missing Required Fields',
      })
    }

    const token = await getToken()
    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }
    console.log('TOKEN', token)

    const baseUrl = `https://api.webmegler.no/app/${tenantId}/1.0/`
    const url = employeeId ? `${baseUrl}/ansatte/${employeeId}` : `${baseUrl}/avdelinger/${departmentId}/ansatte`

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    return res.status(200).json({ message: employeeId ? 'Employee Listed' : 'Employees Listed', data: response.data })
  } catch (error) {
    console.log('ERROR', error.response)
    return res.status(500).json({
      message: 'Employees Listed Failed',
      error: error?.response?.data?.error || error?.response?.statusText,
    })
  }
}

const getEmployeeProfile = async (req, res) => {
  try {
    const { tenantId, employeeId } = req.query
    if (!tenantId || !employeeId) {
      return res.status(400).json({ message: 'Missing Required Fields' })
    }

    const token = await getToken()
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const response = await axios.get(`https://api.webmegler.no/app/${tenantId}/1.0/ansatte/${employeeId}/profilbilde`, {
      responseType: 'arraybuffer',
      headers: { Authorization: `Bearer ${token}` },
    })

    const base64Image = Buffer.from(response.data, 'binary').toString('base64')
    return res.status(200).json({
      message: 'Employee Profile Listed',
      data: `data:image/jpeg;base64,${base64Image}`,
    })
  } catch (error) {
    console.error('ERROR', {
      message: error.message,
      response: error.response?.data,
    })
    return res.status(500).json({
      message: 'Employee Profile Failed',
      error: error?.response?.data?.error || error?.response?.statusText || 'Unknown Error',
    })
  }
}

const getProperties = async (req, res) => {
  try {
    const { tenantId } = req.query
    const { propertyId } = req.params
    if (!tenantId) {
      return res.status(400).json({
        message: 'Missing Required Fields',
      })
    }
    const token = await getToken()
    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    const response = await axios.get(`https://api.webmegler.no/app/${tenantId}/1.0/oppdrag/${propertyId}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    return res.status(200).json({ message: 'Properties Listed', data: deepFixMojibake(response.data) })
  } catch (error) {
    console.log('ERROR', error.response)
    return res.status(500).json({
      message: 'Properties Listed Failed',
      error: error?.response?.data || error?.response?.statusText,
    })
  }
}

const getPropertyBrief = async (req, res) => {
  try {
    const { tenantId, propertyId } = req.query
    if (!tenantId || !propertyId) {
      return res.status(400).json({
        message: 'Missing Required Fields',
      })
    }

    const token = await getToken()
    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    const response = await axios.get(
      `https://api.webmegler.no/app/${tenantId}/1.0/oppdrag/${propertyId}/salgsoppgavetekster`,
      {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    )

    const rawData = response?.data
    const formattedData = []
    let currentAccordion = null

    for (const item of rawData) {
      if (item?.erHovedOverskrift) {
        currentAccordion = {
          group: item,
          subGroup: [],
        }
        formattedData.push(currentAccordion)
      } else if (currentAccordion) currentAccordion.subGroup.push(item)
    }

    return res.status(200).json({ message: 'Property Brief Listed', data: formattedData })
  } catch (error) {
    console.log('ERROR', error.response)
    return res.status(500).json({
      message: 'Property Brief Listed Failed',
      error: error?.response?.data || error?.response?.statusText,
    })
  }
}

// const propertyListWithEmployees = async (req, res) => {
//   try {
//     const { tenantId, employeeId, sortBy, propertyType, bedroom, minPrice, maxPrice, location } = req.query

//     if (!tenantId || !employeeId) {
//       return res.status(400).json({
//         message: 'Missing Required Fields',
//       })
//     }

//     const token = await getToken()
//     if (!token) {
//       return res.status(401).json({
//         message: 'Unauthorized',
//       })
//     }

//     const response = await axios.get(`https://api.webmegler.no/app/${tenantId}/1.0/ansatte/${employeeId}/oppdrag`, {
//       headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
//     })

//     let filteredProperties = response.data.filter(
//       (property) =>
//         property.oppdragstype === 'BoligSalg' &&
//         (property.oppdragstatus === '03.Markedsføringsklart' || property.oppdragstatus === '05.Solgt')
//     )

//     if (propertyType) {
//       filteredProperties = filteredProperties.filter(
//         (property) => property?.markedsføring?.finnInnstillinger?.eiendomstype == propertyType
//       )
//     }

//     if (bedroom) {
//       filteredProperties = filteredProperties.filter(
//         (property) => property?.eiendom?.romfordeling?.antallSoverom == bedroom
//       )
//     }

//     if (minPrice) {
//       filteredProperties = filteredProperties.filter((property) => property?.prisantydning >= minPrice)
//     }

//     if (maxPrice) {
//       filteredProperties = filteredProperties.filter((property) => property?.prisantydning <= maxPrice)
//     }

//     if (sortBy == 'publish')
//       filteredProperties = filteredProperties.filter((property) => property.oppdragstatus == '03.Markedsføringsklart')
//     else if (sortBy == 'pricelh') filteredProperties.sort((a, b) => a.prisantydning - b.prisantydning)
//     else if (sortBy == 'pricehl') filteredProperties.sort((a, b) => b.prisantydning - a.prisantydning)

//     filteredProperties = [
//       ...filteredProperties.filter((property) => property.oppdragstatus != '05.Solgt'),
//       ...filteredProperties.filter((property) => property.oppdragstatus == '05.Solgt'),
//     ]

//     if (location) {
//       const regex = new RegExp(location, 'i')
//       filteredProperties = filteredProperties.filter((property) => {
//         return property?.eiendom?.adresse?.match(regex)
//       })
//     }

//     const maxPrisantydning = filteredProperties.reduce((max, property) => {
//       return property.prisantydning > max ? property.prisantydning : max
//     }, 0)

//     const maxBedroom = filteredProperties.reduce((max, property) => {
//       return property.eiendom?.romfordeling?.antallSoverom > max ? property.eiendom?.romfordeling?.antallSoverom : max
//     }, 0)

//     return res.status(200).json({
//       message: 'Properties Listed',
//       data: filteredProperties,
//       maxPrice: maxPrisantydning,
//       maxBedroom: maxBedroom,
//     })
//   } catch (error) {
//     console.log('ERROR', error.response)
//     return res.status(500).json({
//       message: 'Properties Listed Failed',
//       error: error?.response?.data || error?.response?.statusText,
//     })
//   }
// }

const propertyListWithEmployees = async (req, res) => {
  try {
    const { tenantId, employeeId, sortBy, propertyType, bedroom, minPrice, maxPrice, location } = req.query

    if (!tenantId || !employeeId) {
      return res.status(400).json({
        message: 'Missing Required Fields',
      })
    }

    const token = await getToken()
    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    const response = await axios.get(`https://api.webmegler.no/app/${tenantId}/1.0/ansatte/${employeeId}/oppdrag`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const cleanedData = deepFixMojibake(response.data)

    let filteredProperties

    if (sortBy === 'publish') {
      filteredProperties = cleanedData.filter(
        (property) => (property.oppdragstype === 'BoligSalg' || property.oppdragstype === 'NaeringSalg') && property.oppdragstatus === '03.Markedsføringsklart'
      )
    } else {
      filteredProperties = cleanedData.filter(
        (property) =>
          (property.oppdragstype === 'BoligSalg' || property.oppdragstype === 'BoligSalgProsjektertBuOppfLov' || property.oppdragstype === 'NaeringSalg') &&
        // property.oppdragstype == 'BoligSalgProsjektertBuOppfLov' &&
          (property.oppdragstatus === '03.Markedsføringsklart' || property.oppdragstatus === '05.Solgt')
      )
    }

    if (propertyType) {
      filteredProperties = filteredProperties.filter(
        (property) => property?.markedsføring?.finnInnstillinger?.eiendomstype == propertyType
      )
    }

    if (bedroom) {
      filteredProperties = filteredProperties.filter(
        (property) => property?.eiendom?.romfordeling?.antallSoverom == bedroom
      )
    }

    if (minPrice) {
      filteredProperties = filteredProperties.filter((property) => property?.prisantydning >= minPrice)
    }

    if (maxPrice) {
      filteredProperties = filteredProperties.filter((property) => property?.prisantydning <= maxPrice)
    }

    if (location) {
      const regex = new RegExp(location, 'i')
      filteredProperties = filteredProperties.filter((property) => property?.eiendom?.adresse?.match(regex))
    }

    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    filteredProperties = filteredProperties.filter((property) => {
      if(property.oppdragstatus != '05.Solgt') return true
      const saleDate = new Date(property.okonomi?.omsetningsdetaljer?.akseptDato || property.akseptDato);
      return saleDate >= oneYearAgo; // only include sold properties in the last year      
    })

    let finalProperties = []

    if (sortBy === 'publish') {
      finalProperties = filteredProperties.sort((a, b) => b.id - a.id)
    } else {
      const soldProperties = filteredProperties.filter((property) => property.oppdragstatus === '05.Solgt')
      let activeProperties = filteredProperties.filter((property) => property.oppdragstatus !== '05.Solgt')

      if (sortBy === 'pricelh') {
        activeProperties.sort((a, b) => a.prisantydning - b.prisantydning)
      } else if (sortBy === 'pricehl') {
        activeProperties.sort((a, b) => b.prisantydning - a.prisantydning)
      } else {
        activeProperties.sort((a, b) => b.id - a.id)
      }

      soldProperties.sort((a, b) => b.id - a.id)

      finalProperties = [...activeProperties, ...soldProperties]
    }

    const maxPrisantydning = finalProperties.reduce((max, property) => {
      return property.prisantydning > max ? property.prisantydning : max
    }, 0)

    const maxBedroom = finalProperties.reduce((max, property) => {
      return property.eiendom?.romfordeling?.antallSoverom > max ? property.eiendom?.romfordeling?.antallSoverom : max
    }, 0)

    return res.status(200).json({
      message: 'Properties Listed',
      data: finalProperties,
      maxPrice: maxPrisantydning,
      maxBedroom: maxBedroom,
    })
  } catch (error) {
    console.log('ERROR', error.response)
    return res.status(500).json({
      message: 'Properties Listed Failed',
      error: error?.response?.data || error?.response?.statusText,
    })
  }
}

const propertyImages = async (req, res) => {
  try {
    const { tenantId, propertyId } = req.query

    if (!tenantId || !propertyId) {
      return res.status(400).json({
        message: 'Missing Required Fields',
      })
    }

    const token = await getToken()
    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    const response = await axios.get(`https://api.webmegler.no/app/${tenantId}/1.0/oppdrag/${propertyId}/bilder`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    return res.status(200).json({ message: 'Property Images Listed', data: response.data })
  } catch (error) {
    console.log('ERROR', error.response)
    return res.status(500).json({
      message: 'Properties Listed Failed',
      error: error?.response?.data || error?.response?.statusText,
    })
  }
}

const getDocumentsForProperty = async (req, res) => {
  try {
    const { tenantId, propertyId } = req.query

    if (!tenantId || !propertyId) {
      return res.status(400).json({
        message: 'Missing Required Fields',
      })
    }

    const token = await getToken()
    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    const response = await axios.get(`https://api.webmegler.no/app/${tenantId}/1.0/oppdrag/${propertyId}/dokumenter`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    return res.status(200).json({ message: 'Property Documents Listed', data: response.data })
  } catch (error) {
    console.log('ERROR', error.response)
    return res.status(500).json({
      message: 'Property Documents Listed Failed',
      error: error?.response?.data || error?.response?.statusText,
    })
  }
}

const getDocumentForPropertyById = async (req, res) => {
  try {
    const { tenantId, propertyId } = req.query
    const { documentId } = req.params

    if (!tenantId || !documentId) {
      return res.status(400).json({
        message: 'Missing Required Fields',
      })
    }

    const token = await getToken()
    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    const response = await axios.get(
      `https://api.webmegler.no/app/${tenantId}/1.0/oppdrag/${propertyId}/dokumenter/${documentId}`,
      {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    )

    return res.status(200).json({ message: 'Property Document Retrieved', data: response.data })
  } catch (error) {
    console.log('ERROR', error.response)
    return res.status(500).json({
      message: 'Property Document Retrieval Failed',
      error: error?.response?.data || error?.response?.statusText,
    })
  }
}

const getFileForDocumentInPDF = async (req, res) => {
  try {
    const { tenantId, propertyId } = req.query
    const { documentId } = req.params

    if (!tenantId || !propertyId) {
      return res.status(400).json({ message: 'Missing Required Fields' })
    }

    const token = await getToken()
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const response = await axios.get(
      `https://api.webmegler.no/app/${tenantId}/1.0/oppdrag/${propertyId}/dokumenter/${documentId}/pdffile`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'stream',
      }
    )

    console.log('Upstream Content-Type:', response.headers['content-type'])

    // Pass through the upstream Content-Type
    const upstreamContentType = response.headers['content-type'] || 'application/octet-stream'
    res.setHeader('Content-Type', upstreamContentType)

    // Optionally pass Content-Disposition if needed for download:
    const disposition = response.headers['content-disposition']
    if (disposition) {
      res.setHeader('Content-Disposition', disposition)
    }

    response.data.pipe(res)

    response.data.on('error', (streamErr) => {
      console.error('Stream Error:', streamErr)
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming file', error: streamErr.message })
      } else {
        res.destroy(streamErr)
      }
    })
  } catch (error) {
    console.log('ERROR', error.response?.status)
    if (!res.headersSent) {
      if (error.response?.status === 404) {
        return res.status(404).json({ message: 'Document not found' })
      }
      return res.status(500).json({
        message: 'Failed to retrieve document',
        error: error?.response?.data || error?.response?.statusText,
      })
    } else {
      res.destroy(error)
    }
  }
}

const getLinkerFileInPDF = async (req, res) => {
  try {
    const { tenantId, propertyId } = req.query

    if (!tenantId || !propertyId) {
      return res.status(400).json({ message: 'Missing Required Fields' })
    }

    const token = await getToken()
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const response = await axios.get(`https://api.webmegler.no/app/${tenantId}/1.0/oppdrag/${propertyId}/linker`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    return res.status(200).json({ message: 'Linker File Retrieved', data: response.data })
  } catch (error) {
    console.log('ERROR', error.response)
    return res.status(500).json({
      message: 'Linker File Retrieval Failed',
      error: error?.response?.data || error?.response?.statusText,
    })
  }
}

const getTimingForVisit = async (req, res) => {
  try {
    const { tenantId } = req.query
    const { propertyId } = req.params
    if (!tenantId || !propertyId) {
      return res.status(400).json({ message: 'Missing Required Fields' })
    }

    const token = await getToken()
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const response = await axios.get(`https://api.webmegler.no/app/${tenantId}/1.0/oppdrag/${propertyId}/dagbok`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    return res.status(200).json({ message: 'Visit Timing Retrieved', data: response.data })
  } catch (error) {
    console.log('ERROR', error.response)
    return res.status(500).json({
      message: 'Visit Timing Retrieval Failed',
      error: error?.response?.data || error?.response?.statusText,
    })
  }
}

const getReviews = async (req, res) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJ72CICAA9QUYRuc-bQFMQwyw&fields=name,rating,reviews&language=no&key=AIzaSyDCwo9b4aSScUeys_nPQJ99aA7MUcnrzOc')
    
    return res.status(200).json({ message: 'Reviews Retrived', data: response?.data?.result || response.data})
    
  } catch (error) {
    console.log('ERROR', error.response)
    return res.status(500).json({
      message: 'Reviews Retrieval Failed',
      error: error?.response.data
    })
  }
}

const fetchDescription = async (url) => {
  const resp = await axios.get(url, { responseType: "arraybuffer" })
  const contentType = resp.headers["content-type"]?.toLowerCase() || ""
  const buf = Buffer.from(resp.data)

  // HTML case
  if (contentType.includes("html") || buf.toString("utf8", 0, 32).toLowerCase().includes("<html")) {
    const $ = load(buf.toString("utf8"))

    // 1. Try meta description / og:description first
    let desc =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content")

    // 2. If empty, grab all <p> inside main content
    if (!desc) {
      // you can be more specific if you know container div class
      desc = $("article, .main-content, body").find("p")
        .map((i, el) => $(el).text().trim())
        .get()
        .filter(Boolean)
        .join("\n\n") // preserve paragraphs
    }

    // 3. fallback: all text
    if (!desc) desc = $("body").text().trim()

    return desc
  }

  // fallback plain text
  return buf.toString("utf8").trim()
}

const getEmployeeDescriptions = async (req, res) => {
  try {
    // 1) Fetch legacy XML

    const token = await getToken()
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const xmlResp = await axios.get('https://api.webmegler.no/legacy/xml/wnsokemotorxml.exe?/k381/aansatte/i3000003', { headers: { Authorization: `Bearer ${token}` }, responseType: "text" })

    // 2) Parse XML
    const parser = new XMLParser({ ignoreAttributes: false })
    const xml = parser.parse(xmlResp.data)
    
    const ansatte = xml?.ansatte?.ansatt || []
const employees = (Array.isArray(ansatte) ? ansatte : [ansatte])
  .map((a) => {
    const felter = Array.isArray(a.felt) ? a.felt : [a.felt]
    const name = felter.find((f) => f["@_navn"] === "navn")?.["#text"] || ""
    let url = felter.find((f) => f["@_navn"] === "urlhtmlpresentasjon_ansatt")?.["#text"] || ""
    if (url) url = decode(url)  // 👈 decode entities like &#58; -> :
    return { id: a["@_id"], name, url }
  })
  .filter((e) => e.url)    

    // 3) For each, fetch description
    const results = []
    for (const e of employees) {
      try {
        const desc = await fetchDescription(e.url)
        
        results.push({ id: e.id, name: e.name, description: desc })
      } catch (err) {
        results.push({ id: e.id, name: e.name, description: `(error fetching: ${err.message})` })
      }
    }

    return res.status(200).json({
      message: "Employee descriptions listed",
      data: results,
    })
  } catch (error) {
    console.error("ERROR", error.response?.data || error.message)
    return res.status(500).json({
      message: "Fetching employee descriptions failed",
      error: error?.response?.data?.error || error?.response?.statusText,
    })
  }
}

const sendEnquiry = async (req, res) => {
  try {
    const { firstName, lastName, postalCode, email, phone, message, to } = req.body

    const subject = `Ny henvendelse fra ${firstName}`
    const body = `
      Fornavn: ${firstName}
      Etternavn: ${lastName}
      Postnummer: ${postalCode}
      E-post: ${email}
      Telefonnummer: ${phone}
      Melding: ${message}
    `
    const html = `
      <p><strong>Fornavn:</strong> ${firstName}</p>
      <p><strong>Etternavn:</strong> ${lastName}</p>
      <p><strong>Postnummer:</strong> ${postalCode}</p>
      <p><strong>E-post:</strong> ${email}</p>
      <p><strong>Telefonnummer:</strong> ${phone}</p>
      <p><strong>Melding:</strong><br/>${message?.replace(/\n/g, '<br/>')}</p>
    `

    const result = await sendMail(to, subject, body, html)
    console.log('Email sent result:', result);
    
    return res.status(200).json({ message: 'Enquiry Sent Successfully', data: result })
  } catch (error) {
    console.error("ERROR", error);
    
    return res.status(500).json({
      message: 'Enquiry Sending Failed',
      error: error?.response
    }) 
  }
}

export {
  createToken,
  getToken,
  getCompanies,
  getDepartments,
  getEmployees,
  getEmployeeProfile,
  getProperties,
  propertyImages,
  propertyListWithEmployees,
  getPropertyBrief,
  getDocumentsForProperty,
  getDocumentForPropertyById,
  getFileForDocumentInPDF,
  getLinkerFileInPDF,
  getTimingForVisit,
  getReviews,
  getEmployeeDescriptions,
  sendEnquiry
}
