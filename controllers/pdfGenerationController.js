import axios from "axios";
import puppeteer from "puppeteer";
import fs from 'fs'
import ejs from 'ejs'
import path from "path"
import pLimit from "p-limit";
import { fileURLToPath } from "url"
import { execFile } from 'child_process'
import * as cheerio from 'cheerio'
import { load } from 'cheerio'
import { FIELD_MAP } from "./sync-text-from-webmegler.js";
import { syncTextFromWebmegler, syncAll } from "./sync-text-from-webmegler.js";
import { syncPropertyData } from "../helpers/syncWebmegler.js";
import { promisify } from 'util'
import { decode } from 'html-entities'
import { XMLParser } from "fast-xml-parser"
// import { fromBuffer } from 'pdf2pic'
import { pdf } from 'pdf-to-img'
import os from 'os'
import { deepFixMojibake } from '../helpers/fixMojibake.js'
const execFileP = promisify(execFile)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let cachedToken = null
let tokenExpiryTime = null


// ─── Suppress noisy pdfjs warnings ───────────────────────────────────────────
const originalWarn = console.warn
console.warn = (...args) => {
    const msg = args[0]?.toString() || ''
    if (
        msg.includes('CCITTFaxStream') ||
        msg.includes('TT: undefined function') ||
        msg.includes('TT: invalid function') ||
        msg.includes('JBig2Image')
    ) return
    originalWarn.apply(console, args)
}

// ─── Sleep helper ─────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

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

// ─── Convert PDF buffer → array of base64 PNG strings (one per page) ─────────
// const convertPdfToImages = async (pdfBuffer, documentId) => {
//     try {
//         const images = []
//         const document = await pdf(pdfBuffer, { scale: 1.0 })

//         for await (const page of document) {
//             // each `page` is a PNG Buffer
//             const base64 = page.toString('base64')
//             images.push(`data:image/png;base64,${base64}`)
//         }

//         console.log(`  → Document ${documentId}: ${images.length} page(s) converted`)
//         return images

//     } catch (error) {
//         console.log(`Failed to convert PDF ${documentId} to images:`, error.message)
//         return []
//     }
// }

// ─── Fetch single PDF as Buffer with retry on 429 ────────────────────────────
// const fetchPdfBuffer = async (propertyId, documentId, token, delayMs = 1200) => {
//     for (let attempt = 1; attempt <= 2; attempt++) {
//         try {
//             const url = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}/dokumenter/${documentId}/pdffile`
//             const response = await axios.get(url, {
//                 headers: { Authorization: `Bearer ${token}` },
//                 responseType: 'arraybuffer',
//                 timeout: 15000   // ← 15s timeout, don't hang forever
//             })
//             return Buffer.from(response.data)
//         } catch (error) {
//             const status = error?.response?.status
//             if (error?.response?.status === 429 && attempt < 2) {
//                 await sleep(600)
//             } else {
//                 console.log(`  ✗ Fetch failed ${documentId}`)
//                 return null
//             }
//         }
//     }
//     return null
// }

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

const getPropertiesList = async (req, res) => {
    try {
        const { tenantId, employeeId } = req.query
        if (!tenantId || !employeeId) return res.status(400).json({ message: 'Missing Fields' })

        const token = await getToken()
        if (!token) return res.status(401).json({ message: 'Unauthorized' })

        const response = await axios.get(`https://api.webmegler.no/app/${tenantId}/1.0/ansatte/${employeeId}/oppdrag`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        const cleanedData = deepFixMojibake(response.data)

        let filteredProperties = cleanedData.filter((property) => (property.oppdragstype === 'BoligSalg' || property.oppdragstype === 'BoligSalgProsjektertBuOppfLov' || property.oppdragstype === 'NaeringSalg') /* && (property.oppdragstatus === '03.Markedsføringsklart' || property.oppdragstatus === '05.Solgt') */)
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

        filteredProperties = filteredProperties.filter((property) => {
            if (property.oppdragstatus != '05.Solgt') return true
            const saleDate = new Date(property.okonomi?.omsetningsdetaljer?.akseptDato || property.akseptDato);
            return saleDate >= oneYearAgo; // only include sold properties in the last year      
        })

        let finalProperties = []
        const soldProperties = filteredProperties.filter((property) => property.oppdragstatus === '05.Solgt')
        let activeProperties = filteredProperties.filter((property) => property.oppdragstatus !== '05.Solgt')
        activeProperties.sort((a, b) => b.id - a.id)
        soldProperties.sort((a, b) => b.id - a.id)
        finalProperties = [...activeProperties, ...soldProperties]

        return res.status(200).json({ message: 'Properties Listed Successfully', data: finalProperties })
    } catch (error) {
        console.log('ERROR', error.response)
        return res.status(500).json({
            message: 'Properties Listed Failed',
            error: error?.response?.data || error?.response?.statusText,
        })
    }
}

const getPropertyDetail = async (req, res) => {
    try {
        const { tenantId, propertyId } = req.query
        if (!tenantId || !propertyId) return res.status(400).json({ message: 'Missing Required Fields' })

        const token = await getToken()
        if (!token) return res.status(401).json({ message: 'Unauthorized' })

        const response = await axios.get(`https://api.webmegler.no/app/${tenantId}/1.0/oppdrag/${propertyId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        const cleanedData = deepFixMojibake(response.data)
        console.log("response", cleanedData);

        return res.status(200).json({ message: 'Property Brief Fetched Successfully', data: cleanedData })
    } catch (error) {
        console.log('ERROR', error.response)
        return res.status(500).json({
            message: 'Property Brief Listed Failed',
            error: error?.response?.data || error?.response?.statusText,
        })
    }
}

const getPropertyImages = async (req, res) => {
    try {
        const { tenantId, propertyId } = req.query
        if (!tenantId || !propertyId) return res.status(400).json({ message: 'Missing Required Fields' })

        const token = await getToken()
        if (!token) return res.status(401).json({ message: 'Unauthorized' })

        const htmlPath = path.join(__dirname, `../uploads/properties-html/${propertyId}`, `${propertyId}.html`)
        const pdfPath = path.join(__dirname, `../uploads/properties-pdf/${propertyId}`, `${propertyId}.pdf`)

        const propertyHtml = fs.existsSync(htmlPath)
        const propertyPdf = fs.existsSync(pdfPath)

        const response = await axios.get(`https://api.webmegler.no/app/${tenantId}/1.0/oppdrag/${propertyId}/bilder`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        return res.status(200).json({ message: 'Property Images Fetched Successfully', data: response.data, propertyHtml, propertyPdf })
    } catch (error) {
        console.log('ERROR', error.response)
        return res.status(500).json({
            message: 'Property Images Fetching Failed',
            error: error?.response?.data || error?.response?.statusText,
        })
    }
}

const getPropertyDocumentImages = async (req, res) => {
    try {
        const { tenantId, propertyId } = req.query
        if (!tenantId || !propertyId) return res.status(400).json({ message: 'Missing Required Fields' })

        const token = await getToken()
        if (!token) return res.status(401).json({ message: 'Unauthorized' })

        const headers = { Authorization: `Bearer ${token}` }

        const { data: allDocuments } = await axios.get(
            `https://api.webmegler.no/app/${tenantId}/1.0/oppdrag/${propertyId}/dokumenter`,
            { headers }
        )

        // const EXCLUDED_DOCUMENT_NAMES = [
        //     'prospekt'
        // ]

        const pdfDocuments = (allDocuments || []).filter(doc => /* {
            if (doc.filtype !== 'pdf') return false
            const navn = doc.navn?.toLowerCase() || ''
            return !EXCLUDED_DOCUMENT_NAMES.some(ex => navn.includes(ex))
        } */ doc.filtype === 'pdf' && doc.kategori === 'Diverse til salgsoppgave')

        console.log(`Found ${pdfDocuments.length} PDF documents for property ${propertyId}`)

        // ─── Stream response — send each doc as it finishes ───────────────────
        res.setHeader('Content-Type', 'application/x-ndjson')
        res.setHeader('Transfer-Encoding', 'chunked')
        res.flushHeaders()

        const fetchLimit = pLimit(3)
        const convertLimit = pLimit(Math.max(2, os.cpus().length))

        let completed = 0

        await Promise.all(
            pdfDocuments.map(doc =>
                fetchLimit(async () => {
                    const buffer = await fetchPdfBuffer(propertyId, doc.id, token)
                    if (!buffer) return

                    const images = await convertLimit(() =>
                        convertPdfToBase64Fast(buffer, doc.id)
                    )
                    if (!images.length) return

                    completed++

                    // Write each doc immediately as it's ready
                    res.write(JSON.stringify({
                        id: doc.id,
                        navn: doc.navn,
                        kategori: doc.kategori || '',
                        totalPages: images.length,
                        images,
                        progress: `${completed}/${pdfDocuments.length}`
                    }) + '\n')
                })
            )
        )

        res.end()

    } catch (error) {
        console.log('ERROR', error)
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed', error: error.message })
        } else {
            res.write(JSON.stringify({ error: error.message }) + '\n')
            res.end()
        }
    }
}


const getyBriefProperty = async (req, res) => {
    try {
        const { tenantId, propertyId } = req.query
        if (!tenantId || !propertyId) return res.status(400).json({ message: 'Missing Required Fields' })

        const token = await getToken()
        if (!token) return res.status(401).json({ message: 'Unauthorized' })

        const response = await axios.get(`https://api.webmegler.no/app/${tenantId}/1.0/oppdrag/${propertyId}/salgsoppgavetekster`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        const rawData = response.data
        const formattedData = []
        let currentAccordion = null

        for (const item of rawData) {
            if (item?.erHovedOverskrift) {
                currentAccordion = {
                    group: item,
                    subGroup: [],
                },
                    formattedData.push(currentAccordion)
            } else if (currentAccordion) currentAccordion.subGroup.push(item)
        }

        return res.status(200).json({ message: 'Property brief fetched successfully', data: formattedData })
    } catch (error) {
        console.log('ERROR', error.response)
        return res.status(500).json({
            message: 'Property Brief Fetching Failed',
            error: error?.response?.data || error?.response?.statusText,
        })
    }
}

// const fetchDescription = async (url) => {
//   const resp = await axios.get(url, { responseType: "arraybuffer" })
//   const contentType = resp.headers["content-type"]?.toLowerCase() || ""
//   const buf = Buffer.from(resp.data)

//   // HTML case
//   if (contentType.includes("html") || buf.toString("utf8", 0, 32).toLowerCase().includes("<html")) {
//     const $ = load(buf.toString("utf8"))

//     // 1. Try meta description / og:description first
//     let desc =
//       $('meta[name="description"]').attr("content") ||
//       $('meta[property="og:description"]').attr("content")

//     // 2. If empty, grab all <p> inside main content
//     if (!desc) {
//       // you can be more specific if you know container div class
//       desc = $("article, .main-content, body").find("p")
//         .map((i, el) => $(el).text().trim())
//         .get()
//         .filter(Boolean)
//         .join("\n\n") // preserve paragraphs
//     }

//     // 3. fallback: all text
//     if (!desc) desc = $("body").text().trim()

//     return desc
//   }

//   // fallback plain text
//   return buf.toString("utf8").trim()
// }

// const generateHTML = async (req, res) => {
//     try {
//         const propertyId = req.params.propertyId
//         if (!propertyId) return res.status(400).json({ message: 'Missing Required fields' })

//         const token = await getToken()
//         if (!token) return res.status(401).json({ message: 'Unauthorized' })

//         const headers = {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/x-www-form-urlencoded'
//         }

//         const detailUrl = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}`
//         const imagesUrl = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}/bilder`
//         const briefUrl = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}/salgsoppgavetekster`
//         const documentsUrl = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}/dokumenter`
//         const descUrl = 'https://api.webmegler.no/legacy/xml/wnsokemotorxml.exe?/k381/aansatte/i3000003'

//         const [propertyDetailResponse, propertyImagesReponse, propertyBriefDetailResponse, propertyDocumentsResponse] = await Promise.all([
//             axios.get(detailUrl, { headers }),
//             axios.get(imagesUrl, { headers }),
//             axios.get(briefUrl, { headers }),
//             axios.get(documentsUrl, { headers })
//         ])

//         const propertyDetail = propertyDetailResponse.data

//         const propertyImages = propertyImagesReponse.data?.filter(img => !img.slettet)

//         // ─── Documents: filter PDF only, fetch each as buffer, convert to images ─
//         const allDocuments = propertyDocumentsResponse.data || []
//         const EXCLUDED_DOCUMENT_NAMES = [
//             'prospekt',
//             'risiko oppdrag',
//             'signert oppdrag',
//             'svar på finansieringsspørsmål',
//             'aml-report',
//             'egenerklæring - kundesjekk',
//             'megleropplysninger',
//             'erklæring om bruksrett (servitutt)',
//             'vedtekter og husordensregler',
//             'kundesjekk',
//             'godkjente bygningstegninger.0',
//         ]
//         const pdfDocuments = allDocuments.filter(doc => {
//             if (doc.filtype !== 'pdf') return false
//             const navn = doc.navn?.toLowerCase() || ''
//             return !EXCLUDED_DOCUMENT_NAMES.some(excluded => navn.includes(excluded))
//         })

//         console.log(`Found ${pdfDocuments.length} PDF documents for property ${propertyId}`)

// /*         const limit = pLimit(10)

//         const propertyDocuments = (
//             await Promise.all(
//                 pdfDocuments.map(doc =>
//                     limit(async () => {
//                         console.log(`Fetching "${doc.navn}" (id: ${doc.id})...`)

//                         const buffer = await fetchPdfBuffer(propertyId, doc.id, token)
//                         if (!buffer) {
//                             console.log(`  → Skipping "${doc.navn}" — fetch failed`)
//                             return null
//                         }

//                         const images = await convertPdfToImages(buffer, doc.id)
//                         if (!images.length) {
//                             console.log(`  → Skipping "${doc.navn}" — 0 pages`)
//                             return null
//                         }

//                         return {
//                             id: doc.id,
//                             navn: doc.navn,
//                             kategori: doc.kategori || '',
//                             images
//                         }
//                     })
//                 )
//             )
//         ).filter(Boolean)  // remove nulls

//         console.log(`Total documents ready for template: ${propertyDocuments.length}`) */

//         const fetchLimit = pLimit(6)
//         const convertLimit = pLimit(12)

//         const propertyDocuments = (
//             await Promise.all(
//                 pdfDocuments.map(doc =>
//                     new Promise(resolve => {
//                         fetchLimit(async () => {
//                             const buffer = await fetchPdfBuffer(propertyId, doc.id, token)
//                             if (!buffer) { resolve(null); return }

//                             // Queue conversion immediately — don't await here
//                             // This releases the fetch slot right away
//                             convertLimit(async () => {
//                                 const images = await convertPdfToImages(buffer, doc.id)
//                                 resolve(images.length
//                                     ? { id: doc.id, navn: doc.navn, kategori: doc.kategori || '', images }
//                                     : null
//                                 )
//                             })
//                         })
//                     })
//                 )
//             )
//         ).filter(Boolean)

//         console.log(`Documents ready: ${propertyDocuments.length}`)

//         const rawData = propertyBriefDetailResponse.data

//         const propertyBriefData = []
//         let currentAccordion = null

//         for (const item of rawData) {
//             if (item?.erHovedOverskrift) {
//                 currentAccordion = {
//                     group: item,
//                     subGroup: [],
//                 },
//                     propertyBriefData.push(currentAccordion)
//             } else if (currentAccordion) currentAccordion.subGroup.push(item)
//         }

//         const propertyBriefDetail = propertyBriefData

//         // Fetch megler profile
//         const getMeglerImage = async (employeeId) => {
//             try {
//                 const url = `https://api.webmegler.no/app/381/1.0/ansatte/${employeeId}/profilbilde`
//                 const response = await axios.get(url, { headers, responseType: 'arraybuffer' })
//                 const base64Image = Buffer.from(response.data, 'binary').toString('base64')
//                 return `data:image/jpeg;base64,${base64Image}`
//             } catch (error) {
//                 console.log(`Failed to fetch image for employee ${employeeId}`)
//                 return null
//             }
//         }

//         const megler1Id = propertyDetail?.megler1?.id
//         const megler2Id = propertyDetail?.megler2?.id

//         const [megler1Image, megler2Image] = await Promise.all([
//             megler1Id ? getMeglerImage(megler1Id) : null,
//             megler2Id ? getMeglerImage(megler2Id) : null
//         ])

//         if (propertyDetail?.megler1) {
//             propertyDetail.megler1.profilbilde = megler1Image
//         }
//         if (propertyDetail?.megler2) {
//             propertyDetail.megler2.profilbilde = megler2Image
//         }

//         // Megler description
//         const response = await axios.get(descUrl, { headers, responseType: "text" })

//         // 2) Parse XML
//         const parser = new XMLParser({ ignoreAttributes: false })
//         const xml = parser.parse(response.data)

//         const ansatte = xml?.ansatte?.ansatt || []
//         const employees = (Array.isArray(ansatte) ? ansatte : [ansatte])
//             .map((a) => {
//                 const felter = Array.isArray(a.felt) ? a.felt : [a.felt]
//                 const name = felter.find((f) => f["@_navn"] === "navn")?.["#text"] || ""
//                 let url = felter.find((f) => f["@_navn"] === "urlhtmlpresentasjon_ansatt")?.["#text"] || ""
//                 if (url) url = decode(url)  // 👈 decode entities like &#58; -> :
//                 return { id: a["@_id"], name, url }
//             })
//             .filter((e) => e.url)

//         // 3) For each, fetch description
//         const results = []
//         for (const e of employees) {
//             try {
//                 const desc = await fetchDescription(e.url)

//                 results.push({ id: e.id, name: e.name, description: desc })
//             } catch (err) {
//                 results.push({ id: e.id, name: e.name, description: `(error fetching: ${err.message})` })
//             }
//         }

//         if (propertyDetail?.megler1) {
//             const desc1 = results.find(e => e.id == propertyDetail.megler1?.id)
//             propertyDetail.megler1.desc = desc1?.description || ''
//         }

//         if (propertyDetail?.megler2) {
//             const desc2 = results.find(e => e.id == propertyDetail.megler2?.id)
//             propertyDetail.megler2.desc = desc2?.description || ''
//         }

//         console.log("property detail", propertyDetail);


//         // FILE NAME
//         // const propertyTitle = slugify(propertyDetail?.overskrift, { lower: true, strict: true })
//         // const fileName = `${propertyTitle}.html`

//         // property id
//         const fileName = `${propertyId}.html`

//         const templatePath = path.join(__dirname, '../views/property-template.ejs')

//         // Render EJS 
//         const html = await ejs.renderFile(templatePath, {
//             propertyDetail,
//             propertyImages,
//             propertyBriefDetail,
//             propertyDocuments  
//         })

//         // Save file
//         const filepath = path.join(__dirname, '../uploads/properties-html', fileName)
//         await fs.promises.writeFile(filepath, html)

//         // res.status(200).type('html').send(html)
//         return res.status(201).json({ status: true, statusCode: 201, message: "HTML Generated Successfully", path: html })

//     } catch (error) {
//         console.log('ERROR', error)
//         return res.status(500).json({
//             message: 'HTML Generation Failed',
//             error: error.message,
//         })
//     }
// }


const generateHTML = async (req, res) => {
    try {
        const propertyId = req.params.propertyId
        if (!propertyId) return res.status(400).json({ message: 'Missing Required fields' })
        const token = await getToken()
        if (!token) return res.status(401).json({ message: 'Unauthorized' })
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        const detailUrl = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}`
        const imagesUrl = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}/bilder`
        const briefUrl = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}/salgsoppgavetekster`
        const documentsUrl = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}/dokumenter`
        const descUrl = 'https://api.webmegler.no/legacy/xml/wnsokemotorxml.exe?/k381/aansatte/i3000003'
        const [propertyDetailResponse, propertyImagesReponse, propertyBriefDetailResponse, propertyDocumentsResponse] =
            await Promise.all([
                axios.get(detailUrl, { headers }),
                axios.get(imagesUrl, { headers }),
                axios.get(briefUrl, { headers }),
                axios.get(documentsUrl, { headers })
            ])
        const propertyDetail = propertyDetailResponse.data
        const propertyImages = propertyImagesReponse.data?.filter(img => !img.slettet)
        // ─── DOCUMENTS ───────────────────────────────────────
        const allDocuments = propertyDocumentsResponse.data || []
        console.log("JSON_STRINGIFY", JSON.stringify(allDocuments));

        // const EXCLUDED_DOCUMENT_NAMES = [
        //     'prospekt',
        //     'risiko oppdrag',
        //     'signert oppdrag',
        //     'svar på finansieringsspørsmål',
        //     'aml-report',
        //     'egenerklæring - kundesjekk',
        //     'megleropplysninger',
        //     'erklæring om bruksrett (servitutt)',
        //     'vedtekter og husordensregler',
        //     'kundesjekk',
        //     'godkjente bygningstegninger.0',
        //     'vedlegg'
        // ]
        const pdfDocuments = allDocuments.filter(doc => /* {
            if (doc.filtype !== 'pdf' && doc.kategori !== 'Diverse til salgsoppgave') return false
            const navn = doc.navn?.toLowerCase() || ''
            return !EXCLUDED_DOCUMENT_NAMES.some(excluded => navn.includes(excluded))
        } */ doc.filtype === 'pdf' && doc.kategori === 'Diverse til salgsoppgave')
        console.log(`Found ${pdfDocuments.length} PDF documents for property ${propertyId}`)
        // Network parallel, CPU parallel up to cores
        const fetchLimit = pLimit(8)
        const convertLimit = pLimit(Math.max(2, os.cpus().length))
        const propertyDocuments = (await Promise.all(
            pdfDocuments.map(doc => fetchLimit(async () => {
                const buffer = await fetchPdfBuffer(propertyId, doc.id, token)
                if (!buffer) return null
                const images = await convertLimit(() =>
                    convertPdfToBase64Fast(buffer, doc.id)
                )
                if (!images.length) return null
                return {
                    id: doc.id,
                    navn: doc.navn,
                    kategori: doc.kategori || '',
                    images   // array of "data:image/jpeg;base64,..."
                }
            }))
        )).filter(Boolean)
        console.log(`Documents ready: ${propertyDocuments.length}`)
        // ─── BRIEF DETAIL (accordions) ───────────────────────
        const rawData = propertyBriefDetailResponse.data
        const propertyBriefData = []
        let currentAccordion = null
        for (const item of rawData) {
            if (item?.erHovedOverskrift) {
                currentAccordion = { group: item, subGroup: [] }
                propertyBriefData.push(currentAccordion)
            } else if (currentAccordion) {
                currentAccordion.subGroup.push(item)
            }
        }
        const propertyBriefDetail = propertyBriefData
        // ─── MEGLER IMAGES ───────────────────────────────────
        const getMeglerImage = async (employeeId) => {
            try {
                const url = `https://api.webmegler.no/app/381/1.0/ansatte/${employeeId}/profilbilde`
                const response = await axios.get(url, { headers, responseType: 'arraybuffer' })
                const base64Image = Buffer.from(response.data, 'binary').toString('base64')
                return `data:image/jpeg;base64,${base64Image}`
            } catch (error) {
                console.log(`Failed to fetch image for employee ${employeeId}`)
                return null
            }
        }
        const megler1Id = propertyDetail?.megler1?.id
        const megler2Id = propertyDetail?.megler2?.id
        const [megler1Image, megler2Image] = await Promise.all([
            megler1Id ? getMeglerImage(megler1Id) : null,
            megler2Id ? getMeglerImage(megler2Id) : null
        ])
        if (propertyDetail?.megler1) propertyDetail.megler1.profilbilde = megler1Image
        if (propertyDetail?.megler2) propertyDetail.megler2.profilbilde = megler2Image
        // ─── MEGLER DESCRIPTIONS (parallelized) ──────────────
        const response = await axios.get(descUrl, { headers, responseType: 'text' })
        const parser = new XMLParser({ ignoreAttributes: false })
        const xml = parser.parse(response.data)
        const ansatte = xml?.ansatte?.ansatt || []
        const employees = (Array.isArray(ansatte) ? ansatte : [ansatte])
            .map(a => {
                const felter = Array.isArray(a.felt) ? a.felt : [a.felt]
                const name = felter.find(f => f['@_navn'] === 'navn')?.['#text'] || ''
                /* let url = felter.find(f => f['@_navn'] === 'urlhtmlpresentasjon_ansatt')?.['#text'] || ''
                if (url) url = decode(url) */
                return { id: a['@_id'], name/* , url */ }
            })
        /* .filter(e => e.url) */
        /*         const descLimit = pLimit(6)
                const results = await Promise.all(employees.map(e => descLimit(async () => {
                    try {
                        const desc = await fetchDescription(e.url)
                        return { id: e.id, name: e.name, description: desc }
                    } catch (err) {
                        return { id: e.id, name: e.name, description: `(error fetching: ${err.message})` }
                    }
                })))
                if (propertyDetail?.megler1) {
                    const desc1 = results.find(e => e.id == propertyDetail.megler1?.id)
                    propertyDetail.megler1.desc = desc1?.description || ''
                }
                if (propertyDetail?.megler2) {
                    const desc2 = results.find(e => e.id == propertyDetail.megler2?.id)
                    propertyDetail.megler2.desc = desc2?.description || ''
                } */
        // ─── RENDER & SAVE ───────────────────────────────────
        const fileName = `${propertyId}.html`
        const templatePath = path.join(__dirname, '../views/property-template.ejs')
        const html = await ejs.renderFile(templatePath, {
            propertyDetail,
            propertyImages,
            propertyBriefDetail,
            propertyDocuments
        })
        // const filepath = path.join(__dirname, `../uploads/properties-html/${propertyId}`, fileName)
        // await fs.promises.writeFile(filepath, html)
        const propertyDir = path.join(__dirname, '../uploads/properties-html', propertyId)

        await fs.promises.mkdir(propertyDir, { recursive: true })

        const filepath = path.join(propertyDir, fileName)

        await fs.promises.writeFile(filepath, html)
        return res.status(201).json({
            status: true,
            statusCode: 201,
            message: 'HTML Generated Successfully',
            path: html
        })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({
            message: 'HTML Generation Failed',
            error: error.message,
        })
    }
}

const generateAllHTML = async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`)
    try {
        const token = await getToken()
        if (!token) {
            send({ type: 'error', message: 'Unauthorized' })
            return res.end()
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        const listResponse = await axios.get(
            `https://api.webmegler.no/app/381/1.0/ansatte/3000004/oppdrag`,
            { headers }
        )

        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

        const propertyIds = listResponse.data
            .filter(p =>
                p.oppdragstype === 'BoligSalg' ||
                p.oppdragstype === 'BoligSalgProsjektertBuOppfLov' ||
                p.oppdragstype === 'NaeringSalg'
            )
            .filter(p => {
                if (p.oppdragstatus !== '05.Solgt') return true
                const saleDate = new Date(p.okonomi?.omsetningsdetaljer?.akseptDato || p.akseptDato)
                return saleDate >= oneYearAgo
            })
            .map(p => p.id)

        send({ type: 'start', total: propertyIds.length })

        // ── process 5 properties at a time ──
        const batchLimit = pLimit(2)
        const succeeded = []
        const failed = []

        // await Promise.all(
        //     propertyIds.map(propertyId =>
        //         batchLimit(async () => {
        //             try {
        //                 await generateHTMLForProperty(propertyId, token, headers)
        //                 succeeded.push(propertyId)
        //             } catch (err) {
        //                 failed.push({ propertyId, error: err.message })
        //             }

        //             send({
        //                 type: 'progress',
        //                 propertyId,
        //                 done: succeeded.length + failed.length,
        //                 total: propertyIds.length,
        //                 succeeded: succeeded.length,
        //                 failed: failed.length
        //             })
        //         })
        //     )
        // )

        for (const propertyId of propertyIds) {
            try {
                await generateHTMLForProperty(propertyId, token, headers)
                succeeded.push(propertyId)
            } catch (err) {
                console.log(`Failed property ${propertyId}:`, err.message)
                failed.push({ propertyId, error: err.message })
            }

            send({
                type: 'progress',
                propertyId,
                done: succeeded.length + failed.length,
                total: propertyIds.length,
                succeeded: succeeded.length,
                failed: failed.length
            })

            // give Webmegler's rate limiter room to breathe
            await sleep(2000)
        }

        send({ type: 'done', succeeded: succeeded.length, failed: failed.length, failedDetails: failed })
        res.end()
    } catch (error) {
        console.log('BULK ERROR', error)
        send({ type: 'error', message: error.message })
        res.end()
    }
}

// EXtracted helper
const generateHTMLForProperty = async (propertyId, token, headers) => {
    const detailUrl = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}`
    const imagesUrl = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}/bilder`
    const briefUrl = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}/salgsoppgavetekster`
    const documentsUrl = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}/dokumenter`
    const descUrl = 'https://api.webmegler.no/legacy/xml/wnsokemotorxml.exe?/k381/aansatte/i3000003'
    const [propertyDetailResponse, propertyImagesReponse, propertyBriefDetailResponse, propertyDocumentsResponse] =
        await Promise.all([
            axios.get(detailUrl, { headers }),
            axios.get(imagesUrl, { headers }),
            axios.get(briefUrl, { headers }),
            axios.get(documentsUrl, { headers })
        ])

    const propertyDetail = propertyDetailResponse.data
    const propertyImages = propertyImagesReponse.data?.filter(img => !img.slettet)
    const allDocuments = propertyDocumentsResponse.data || []
    const pdfDocuments = allDocuments.filter(doc =>
        doc.filtype === 'pdf' && doc.kategori === 'Diverse til salgsoppgave'
    )

    const fetchLimit = pLimit(8)
    const convertLimit = pLimit(Math.max(2, os.cpus().length))

    const propertyDocuments = (await Promise.all(
        pdfDocuments.map(doc => fetchLimit(async () => {
            const buffer = await fetchPdfBuffer(propertyId, doc.id, token)
            if (!buffer) return null
            const images = await convertLimit(() => convertPdfToBase64Fast(buffer, doc.id))
            if (!images.length) return null
            return { id: doc.id, navn: doc.navn, kategori: doc.kategori || '', images }
        }))
    )).filter(Boolean)

    // ─── BRIEF DETAIL ────────────────────────────────────
    const rawData = propertyBriefDetailResponse.data
    const propertyBriefDetail = []
    let currentAccordion = null
    for (const item of rawData) {
        if (item?.erHovedOverskrift) {
            currentAccordion = { group: item, subGroup: [] }
            propertyBriefDetail.push(currentAccordion)
        } else if (currentAccordion) {
            currentAccordion.subGroup.push(item)
        }
    }

    // ─── MEGLER IMAGES ───────────────────────────────────
    const getMeglerImage = async (employeeId) => {
        try {
            const url = `https://api.webmegler.no/app/381/1.0/ansatte/${employeeId}/profilbilde`
            const response = await axios.get(url, { headers, responseType: 'arraybuffer' })
            const base64Image = Buffer.from(response.data, 'binary').toString('base64')
            return `data:image/jpeg;base64,${base64Image}`
        } catch (error) {
            console.log(`Failed to fetch image for employee ${employeeId}`)
            return null
        }
    }

    const [megler1Image, megler2Image] = await Promise.all([
        propertyDetail?.megler1?.id ? getMeglerImage(propertyDetail.megler1.id) : null,
        propertyDetail?.megler2?.id ? getMeglerImage(propertyDetail.megler2.id) : null
    ])
    if (propertyDetail?.megler1) propertyDetail.megler1.profilbilde = megler1Image
    if (propertyDetail?.megler2) propertyDetail.megler2.profilbilde = megler2Image

    // ─── RENDER & SAVE ───────────────────────────────────
    const fileName = `${propertyId}.html`
    const templatePath = path.join(__dirname, '../views/property-template.ejs')
    const html = await ejs.renderFile(templatePath, {
        propertyDetail,
        propertyImages,
        propertyBriefDetail,
        propertyDocuments
    })

    const propertyDir = path.join(__dirname, '../uploads/properties-html', String(propertyId))
    await fs.promises.mkdir(propertyDir, { recursive: true })
    await fs.promises.writeFile(path.join(propertyDir, fileName), html)
}

// ─── Helper: GET with timeout + retry on 429 / 503 / timeout ─────────
const axiosGetWithRetry = async (url, config = {}, { retries = 3, baseDelayMs = 1000 } = {}) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // timeout guarantees axios can never hang forever
            return await axios.get(url, { timeout: 15000, ...config })
        } catch (err) {
            const status = err.response?.status
            const isTimeout = err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT'
            const retryable = status === 429 || status === 503 || isTimeout
            const isLast = attempt === retries

            if (!retryable || isLast) throw err

            const retryAfter = err.response?.headers?.['retry-after']
            let waitMs
            if (retryAfter) {
                const asNum = Number(retryAfter)
                waitMs = Number.isNaN(asNum)
                    ? Math.max(0, new Date(retryAfter).getTime() - Date.now())
                    : asNum * 1000
            } else {
                waitMs = baseDelayMs * 2 ** attempt + Math.floor(Math.random() * 250)
            }

            console.warn(`[sync] ${status || err.code} from ${url} — retry ${attempt + 1}/${retries} in ${waitMs}ms`)
            await new Promise(r => setTimeout(r, waitMs))
        }
    }
}

const syncTextsFromWebmegler = async (req, res) => {
    try {
        const propertyId = req.params.propertyId
        if (!propertyId) return res.status(400).json({ message: 'Missing Required fields' })

        const { html, filename } = req.body
        if (!html) return res.status(400).json({ message: 'Missing html in request body' })

        const fileName = resolvePropertyHtmlFileName(propertyId, filename)
        console.log("fileName", fileName);

        const filepath = path.join(__dirname, '../uploads/properties-html', propertyId)

        await fs.promises.mkdir(filepath, { recursive: true })
        const filePath = path.join(filepath, fileName)

        const token = await getToken()
        if (!token) return res.status(401).json({ message: 'Unauthorized' })

        const { updatedHtml, changed, skipped } = await syncPropertyData({
            propertyId,
            token,
            html
        }, false);

        // await fs.promises.writeFile(filePath, updatedHtml)
        console.log(`[sync] ${propertyId}: ${changed.length} updated, ${skipped.length} skipped`)

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: 'Text synced from Webmegler successfully',
            updated: changed.length,
            updatedHtml,
            changed,
            skipped,
            path: `uploads/properties-html/${propertyId}/${fileName}`
        })
    } catch (error) {
        const status = error.response?.status
        const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
        console.log('ERROR', status || error.code, error.message)

        if (status === 429) {
            return res.status(429).json({
                status: false,
                message: 'Webmegler rate limit reached. Please try again shortly.',
                retryAfter: error.response?.headers?.['retry-after'] || null,
                error: error.message
            })
        }
        if (isTimeout) {
            return res.status(504).json({
                status: false,
                message: 'Webmegler did not respond in time (timeout).',
                error: error.message
            })
        }
        return res.status(500).json({
            status: false,
            message: 'Text Sync Failed',
            error: error.message
        })
    }
}

const convertPdfToBase64Fast = async (pdfBuffer, documentId) => {
    // Unique temp directory per call — auto-cleaned at the end
    const tmpDir = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), `pdfconv-${documentId}-`)
    )
    const tmpPdf = path.join(tmpDir, 'in.pdf')
    const prefix = path.join(tmpDir, 'page')
    try {
        await fs.promises.writeFile(tmpPdf, pdfBuffer)
        // -jpeg            → JPEG output (smaller + faster than PNG)
        // -r 100           → 100 DPI; tune 80–120
        // -jpegopt quality → 75 is the sweet spot for documents
        await execFileP('pdftoppm', [
            '-jpeg',
            '-r', '100',
            '-jpegopt', 'quality=75',
            tmpPdf,
            prefix
        ], { timeout: 60000 })
        // Collect generated JPEGs in correct page order
        const files = (await fs.promises.readdir(tmpDir))
            .filter(f => f.startsWith('page-') && f.endsWith('.jpg'))
            .sort((a, b) => {
                const na = parseInt(a.match(/-(\d+)\.jpg$/)?.[1] || '0', 10)
                const nb = parseInt(b.match(/-(\d+)\.jpg$/)?.[1] || '0', 10)
                return na - nb
            })
        // Read each file → base64 data URI (in parallel)
        const images = await Promise.all(files.map(async f => {
            const buf = await fs.promises.readFile(path.join(tmpDir, f))
            return `data:image/jpeg;base64,${buf.toString('base64')}`
        }))
        console.log(`  → Document ${documentId}: ${images.length} page(s) converted`)
        return images
    } catch (error) {
        console.log(`Failed to convert PDF ${documentId}:`, error.message)
        return []
    } finally {
        // Always clean up temp dir, never leave artifacts on disk
        fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => { })
    }
}

const fetchPdfBuffer = async (propertyId, documentId, token, maxAttempts = 5) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const url = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}/dokumenter/${documentId}/pdffile`
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'arraybuffer',
                timeout: 20000
            })
            return Buffer.from(response.data)
        } catch (error) {
            const status = error?.response?.status
            if (status === 429 && attempt < maxAttempts) {
                await sleep(800 * attempt)
                continue
            }
            if (attempt < maxAttempts && (!status || status >= 500)) {
                await sleep(400 * attempt)
                continue
            }
            console.log(`  ✗ Fetch failed ${documentId} (status: ${status || 'no response'})`)
            return null
        }
    }
    return null
}

const sanitizeHtmlFileName = (value = '') => value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\.html?$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const getHtmlOutputDir = (propertyId) => path.join(__dirname, '../uploads/properties-html', propertyId || '')

const buildPropertyHtmlFileName = (propertyId, name = '') => {
    const safeName = sanitizeHtmlFileName(name)
    return safeName ? `${propertyId}-${safeName}.html` : `${propertyId}.html`
}

const resolveExistingPropertyHtmlFileName = (propertyId, filename = '') => {
    const trimmedFileName = filename.toString().trim()
    if (!trimmedFileName) return ''

    if (trimmedFileName.includes('/') || trimmedFileName.includes('\\')) {
        const error = new Error('Invalid filename')
        error.statusCode = 400
        throw error
    }

    const finalFileName = /\.html?$/i.test(trimmedFileName)
        ? trimmedFileName
        : `${trimmedFileName}.html`
    const lowerFileName = finalFileName.toLowerCase()

    if (
        !lowerFileName.endsWith('.html') ||
        (finalFileName !== `${propertyId}.html` && !finalFileName.startsWith(`${propertyId}-`))
    ) {
        const error = new Error('Invalid filename for this property')
        error.statusCode = 400
        throw error
    }

    return finalFileName
}

const writeHTML = async (req, res) => {
    try {
        const { html, fileName, name } = req.body
        const propertyId = req.params.propertyId

        if (!html || !propertyId) {
            return res.status(400).json({
                message: 'Missing Required fields'
            })
        }

        const queryFileName = req.query.filename || req.query.fileName
        const savedName = fileName || name || ''

        const finalFileName = queryFileName
            ? resolveExistingPropertyHtmlFileName(propertyId, queryFileName)
            : buildPropertyHtmlFileName(propertyId, savedName)

        const baseOutputDir = getHtmlOutputDir(propertyId)

        // Create property-specific directory
        const propertyDir = path.join(baseOutputDir)

        await fs.promises.mkdir(propertyDir, { recursive: true })

        const filepath = path.join(propertyDir, finalFileName)

        const responseName =
            finalFileName === `${propertyId}.html`
                ? propertyId
                : finalFileName
                    .replace(`${propertyId}-`, '')
                    .replace(/\.html$/i, '')

        // If updating an existing file, verify it exists
        if (queryFileName) {
            try {
                await fs.promises.access(filepath, fs.constants.F_OK)
            } catch {
                return res.status(404).json({
                    message: 'HTML file not found'
                })
            }
        }

        await fs.promises.writeFile(filepath, html)

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: 'HTML skrevet vellykket',
            data: {
                propertyId,
                name: savedName || responseName,
                fileName: finalFileName,
                path: `uploads/properties-html/${propertyId}/${finalFileName}`
            }
        })
    } catch (error) {
        console.log('ERROR', error)

        return res.status(error.statusCode || 500).json({
            message: 'Writing HTML Failed',
            error: error.message
        })
    }
}

const getSavedHTMLTemplates = async (req, res) => {
    try {
        const propertyId = req.params.propertyId
        if (!propertyId) return res.status(400).json({ message: 'Missing Required fields' })

        const outputDir = getHtmlOutputDir(propertyId)
        if (!fs.existsSync(outputDir)) {
            return res.status(200).json({
                status: true,
                statusCode: 200,
                message: 'Ingen lagrede HTML-maler funnet for denne egenskapen',
                data: []
            })
        }
        await fs.promises.mkdir(outputDir, { recursive: true })

        const files = await fs.promises.readdir(outputDir)
        const matchingFiles = files
            .filter(file => file.startsWith(`${propertyId}-`))
            .filter(file => file.endsWith('.html'))
            .sort((a, b) => a.localeCompare(b))

        const includeHtml = req.query.includeHtml === 'true'
        const templates = await Promise.all(matchingFiles.map(async file => {
            const filepath = path.join(outputDir, file)
            const stat = await fs.promises.stat(filepath)
            const rawName = file.replace(`${propertyId}-`, '').replace(/\.html$/i, '')

            const data = {
                propertyId,
                name: rawName,
                fileName: file,
                path: `uploads/properties-html/${propertyId}/${file}`,
                size: stat.size,
                createdAt: stat.birthtime,
                updatedAt: stat.mtime
            }

            if (includeHtml) data.html = await fs.promises.readFile(filepath, 'utf8')
            return data
        }))

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: 'Saved HTML templates fetched successfully',
            data: templates
        })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({
            message: 'Fetching saved HTML templates failed',
            error: error.message,
        })
    }
}

const getSavedHTMLTemplatesGrouped = async (req, res) => {
    try {
        const baseDir = path.join(__dirname, "../uploads/properties-html");

        if (!fs.existsSync(baseDir)) {
            return res.status(200).json({
                status: true,
                statusCode: 200,
                message: "No HTML templates found",
                data: []
            });
        }

        const propertyFolders = await fs.promises.readdir(baseDir, {
            withFileTypes: true
        });

        const result = [];

        for (const folder of propertyFolders) {
            if (!folder.isDirectory()) continue;

            const propertyId = folder.name;
            if (req.query.propertyId && propertyId === req.query.propertyId) continue;
            const folderPath = path.join(baseDir, propertyId);

            const files = await fs.promises.readdir(folderPath);

            // Skip the default file (3000014.html) and include only custom templates
            const templates = files
                .filter(file =>
                    file.endsWith(".html") &&
                    file !== `${propertyId}.html`
                )
                .sort().map(file => ({ fileName: file, path: `uploads/properties-html/${propertyId}/${file}` }));


            // Only include folders that actually have custom templates
            if (templates.length > 0) {
                result.push({
                    propertyId,
                    templates
                });
            }
        }

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Saved HTML templates fetched successfully",
            data: result
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Fetching saved HTML templates failed",
            error: error.message
        });
    }
};

const openHTMLTemplate = async (req, res) => {
    try {
        const propertyId = req.params.propertyId // 600000011
        if (!propertyId) return res.status(400).json({ message: 'Missing Required fields' })

        const { pathUrl } = req.body // uploads/properties-html/600000009/600000009-tempate-a.html
        if (!pathUrl) return res.status(400).json({ message: 'Missing path in request body' })

        const token = await getToken()
        if (!token) return res.status(401).json({ message: 'Unauthorized' })

        const filepath = path.join(__dirname, `../${pathUrl}`)

        const html = await fs.promises.readFile(filepath, 'utf-8')

        const { updatedHtml, changed, skipped } = await syncPropertyData({ propertyId, token, html })

        const newFilepath = path.join(__dirname, '../uploads/properties-html', propertyId)

        await fs.promises.mkdir(newFilepath, { recursive: true })

        // Original filename: 600000009-template-a.html
        const originalFileName = path.basename(pathUrl);

        // New filename: 600000011-template-a.html
        const fileName = propertyId + "-" + originalFileName;
        console.log("fileName", fileName);

        const filePath = path.join(newFilepath, fileName) // need fileName as 600000011-template-a.html

        await fs.promises.writeFile(filePath, updatedHtml)


        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: 'HTML template opened and synced successfully',
            updated: changed.length,
            updatedHtml,
            changed,
            skipped,
            path: filePath
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Failed to open HTML template",
            error: error.message
        });
    }
}

// const generatePDF = async (req, res) => {
//     try {
//         const propertyId = req.params.propertyId
//         if (!propertyId) return res.status(400).json({ message: 'Missing Required fields' })

//         const browser = await puppeteer.launch({
//             headless: true,
//             args: ['--no-sandbox', '--disable-setuid-sandbox'],
//         })

//         const page = await browser.newPage()

//         await page.setViewport({
//             width: 1587,
//             height: 1123,
//             deviceScaleFactor: 1
//         })

//         const htmlPath = path.join(__dirname, `../uploads/properties-html/${propertyId}.html`)
//         await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })

//         await page.evaluate(async () => {
//             const imgs = Array.from(document.images)
//             await Promise.all(imgs.map(img => img.complete ? Promise.resolve()
//                 : new Promise(r => { img.addEventListener('load', r); img.addEventListener('error', r) })))
//         })

//         await page.evaluate(() => {
//             const W = 794, H = 1123
//             const A3_W = 1587   // A3 landscape width

//             const panels = Array.from(document.querySelectorAll('.page, .pdf24_02'))
//             if (!panels.length) return

//             const bgOf = (el) => {
//                 const inline = el.getAttribute('data-page-bg')
//                 if (inline) return inline
//                 const cs = getComputedStyle(el).backgroundColor
//                 return (cs && cs !== 'rgba(0, 0, 0, 0)') ? cs : '#e2cf9e'
//             }

//             const style = document.createElement('style')
//             style.textContent = `
//                 /* A4 single pages (first + last) */
//                 @page a4 { size: ${W}px ${H}px; margin: 0; }
//                 /* A3 landscape paired pages (middle) */
//                 @page a3 { size: ${A3_W}px ${H}px; margin: 0; }

//                 html, body { margin: 0 !important; padding: 0 !important; }
//                 .page, .pdf24_02 {
//                     page-break-after: auto !important;
//                     break-after: auto !important;
//                     page-break-before: auto !important;
//                     break-before: auto !important;
//                 }
//                 .blueBg { page-break-before: auto !important; break-before: auto !important; }
//                 .sheet {
//                     display: flex; flex-direction: row;
//                     height: ${H}px; overflow: hidden;
//                     break-after: page; page-break-after: always; break-inside: avoid;
//                 }
//                 .sheet:last-child { break-after: auto; page-break-after: auto; }

//                 /* A4 single sheet */
//                 .sheet-a4 { width: ${W}px; page: a4; }
//                 .sheet-a4 > .page, .sheet-a4 > .pdf24_02 { flex: 0 0 ${W}px; width: ${W}px; height: ${H}px; }

//                 /* A3 paired sheet */
//                 .sheet-a3 { width: ${A3_W}px; page: a3; }
//                 .sheet-a3 > .page, .sheet-a3 > .pdf24_02 { flex: 0 0 ${W}px; width: ${W}px; height: ${H}px; }
//                 .sheet-a3 > .pad  { flex: 0 0 ${W}px; width: ${W}px; height: ${H}px; }
//             `
//             document.head.appendChild(style)

//             const box = document.createElement('div')
//             panels[0].parentNode.insertBefore(box, panels[0])

//             const sheet = (cls) => {
//                 const s = document.createElement('div')
//                 s.className = 'sheet ' + cls
//                 box.appendChild(s)
//                 return s
//             }
//             const pad = (bg) => {
//                 const p = document.createElement('div')
//                 p.className = 'pad'
//                 p.style.background = bg || '#e2cf9e'
//                 return p
//             }

//             const n = panels.length
//             const last = n - 1

//             // FIRST page -> A4 single
//             const firstSheet = sheet('sheet-a4')
//             firstSheet.appendChild(panels[0])

//             // MIDDLE pages (1 .. n-2) -> A3 pairs
//             for (let i = 1; i < last; i += 2) {
//                 if (i + 1 < last) {
//                     // full A3 pair
//                     const s = sheet('sheet-a3')
//                     s.appendChild(panels[i])
//                     s.appendChild(panels[i + 1])
//                 } else {
//                     // odd middle leftover -> A3 with a color-matched pad
//                     const s = sheet('sheet-a3')
//                     s.appendChild(panels[i])
//                     s.appendChild(pad(bgOf(panels[i])))
//                 }
//             }

//             // MIDDLE pages (1 .. n-2) -> A3 pairs
//             // for (let i = 1; i < last; i += 2) {
//             //     if (i + 1 < last) {
//             //         // full A3 pair
//             //         const s = sheet('sheet-a3')

//             //         // Wrap left page in a positioned container
//             //         const leftWrapper = document.createElement('div')
//             //         leftWrapper.style.cssText = `position:relative; width:${W}px; height:${H}px; flex: 0 0 ${W}px; overflow:hidden;`
//             //         leftWrapper.appendChild(panels[i])

//             //         // Wrap right page and offset all absolute children by W px
//             //         const rightWrapper = document.createElement('div')
//             //         rightWrapper.style.cssText = `position:relative; width:${W}px; height:${H}px; flex: 0 0 ${W}px; overflow:hidden;`

//             //         // Reset absolute positions on the right page's children
//             //         const rightPage = panels[i + 1]
//             //         rightPage.style.position = 'relative'
//             //         rightPage.style.left = '0px'
//             //         rightPage.style.top = '0px'
//             //         rightWrapper.appendChild(rightPage)

//             //         s.appendChild(leftWrapper)
//             //         s.appendChild(rightWrapper)
//             //     } else {
//             //         // odd middle leftover
//             //         const s = sheet('sheet-a3')
//             //         const leftWrapper = document.createElement('div')
//             //         leftWrapper.style.cssText = `position:relative; width:${W}px; height:${H}px; flex: 0 0 ${W}px; overflow:hidden;`
//             //         leftWrapper.appendChild(panels[i])
//             //         s.appendChild(leftWrapper)
//             //         s.appendChild(pad(bgOf(panels[i])))
//             //     }
//             // }

//             // LAST page -> A4 single
//             if (last > 0) {
//                 const lastSheet = sheet('sheet-a4')
//                 lastSheet.appendChild(panels[last])
//             }
//         })

//         const dir = `uploads/properties-pdf/${propertyId}.pdf`
//         const pdfPath = path.join(__dirname, `../` + dir)

//         await page.pdf({
//             path: pdfPath,
//             printBackground: true,
//             preferCSSPageSize: true,
//         })

//         await browser.close()
//         return res.status(201).json({ status: true, statusCode: 201, message: "PDF Generated Successfully", data: { path: dir } })
//     } catch (error) {
//         console.log('ERROR', error)
//         return res.status(500).json({ message: 'PDF Generation Failed', error: error.message })
//     }
// }

const generatePDF = async (req, res) => {
    try {
        const propertyId = req.params.propertyId
        if (!propertyId) return res.status(400).json({ message: 'Missing Required fields' })

        const queryFileName = req.query.filename
        const htmlFileName = resolvePropertyHtmlFileName(propertyId, queryFileName)

        const htmlPath = path.join(__dirname, '../uploads/properties-html', propertyId, htmlFileName)

        try {
            await fs.promises.access(htmlPath, fs.constants.F_OK)
        } catch {
            return res.status(404).json({ message: 'HTML file not found' })
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })

        const page = await browser.newPage()

        await page.setViewport({
            width: 1587,
            height: 1123,
            deviceScaleFactor: 1
        })

        await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })

        await page.evaluate(async () => {
            const imgs = Array.from(document.images)
            await Promise.all(imgs.map(img => img.complete ? Promise.resolve()
                : new Promise(r => { img.addEventListener('load', r); img.addEventListener('error', r) })))
        })

        await page.evaluate(() => {
            const W = 794, H = 1123
            const A3_W = 1587

            const panels = Array.from(document.querySelectorAll('.page, .pdf24_02'))
            if (!panels.length) return

            const bgOf = (el) => {
                const inline = el.getAttribute('data-page-bg')
                if (inline) return inline
                const cs = getComputedStyle(el).backgroundColor
                return (cs && cs !== 'rgba(0, 0, 0, 0)') ? cs : '#e2cf9e'
            }

            const style = document.createElement('style')
            style.textContent = `
                @page a4 { size: ${W}px ${H}px; margin: 0; }
                @page a3 { size: ${A3_W}px ${H}px; margin: 0; }

                html, body { margin: 0 !important; padding: 0 !important; }
                .page, .pdf24_02 {
                    page-break-after: auto !important;
                    break-after: auto !important;
                    page-break-before: auto !important;
                    break-before: auto !important;
                }
                .blueBg { page-break-before: auto !important; break-before: auto !important; }
                .sheet {
                    display: flex; flex-direction: row;
                    height: ${H}px; overflow: hidden;
                    break-after: page; page-break-after: always; break-inside: avoid;
                }
                .sheet:last-child { break-after: auto; page-break-after: auto; }

                .sheet-a4 { width: ${W}px; page: a4; }
                .sheet-a4 > .page, .sheet-a4 > .pdf24_02 { flex: 0 0 ${W}px; width: ${W}px; height: ${H}px; }

                .sheet-a3 { width: ${A3_W}px; page: a3; }
                .sheet-a3 > .page, .sheet-a3 > .pdf24_02 { flex: 0 0 ${W}px; width: ${W}px; height: ${H}px; }
                .sheet-a3 > .pad  { flex: 0 0 ${W}px; width: ${W}px; height: ${H}px; }
            `
            document.head.appendChild(style)

            const box = document.createElement('div')
            panels[0].parentNode.insertBefore(box, panels[0])

            const sheet = (cls) => {
                const s = document.createElement('div')
                s.className = 'sheet ' + cls
                box.appendChild(s)
                return s
            }
            const pad = (bg) => {
                const p = document.createElement('div')
                p.className = 'pad'
                p.style.background = bg || '#e2cf9e'
                return p
            }

            const n = panels.length
            const last = n - 1

            const firstSheet = sheet('sheet-a4')
            firstSheet.appendChild(panels[0])

            for (let i = 1; i < last; i += 2) {
                if (i + 1 < last) {
                    const s = sheet('sheet-a3')
                    s.appendChild(panels[i])
                    s.appendChild(panels[i + 1])
                } else {
                    const s = sheet('sheet-a3')
                    s.appendChild(panels[i])
                    s.appendChild(pad(bgOf(panels[i])))
                }
            }

            if (last > 0) {
                const lastSheet = sheet('sheet-a4')
                lastSheet.appendChild(panels[last])
            }
        })

        const pdfFileName = htmlFileName.replace(/\.html?$/i, '.pdf')
        const pdfDir = path.join(__dirname, '../uploads/properties-pdf', propertyId)
        await fs.promises.mkdir(pdfDir, { recursive: true })

        const pdfPath = path.join(pdfDir, pdfFileName)
        const relativePath = `uploads/properties-pdf/${propertyId}/${pdfFileName}`

        await page.pdf({
            path: pdfPath,
            printBackground: true,
            preferCSSPageSize: true,
        })

        await browser.close()
        return res.status(201).json({ status: true, statusCode: 201, message: "PDF-en er generert", data: { path: relativePath } })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(error.statusCode || 500).json({ message: 'PDF Generation Failed', error: error.message })
    }
}

const resolvePropertyHtmlFileName = (propertyId, filename = '') => {
    const trimmed = filename ? filename.toString().trim() : ''
    if (!trimmed) return `${propertyId}.html`

    if (trimmed.includes('/') || trimmed.includes('\\')) {
        const error = new Error('Invalid filename')
        error.statusCode = 400
        throw error
    }

    const finalFileName = /\.html?$/i.test(trimmed) ? trimmed : `${trimmed}.html`
    const lower = finalFileName.toLowerCase()

    if (
        !lower.endsWith('.html') ||
        (finalFileName !== `${propertyId}.html` && !finalFileName.startsWith(`${propertyId}-`))
    ) {
        const error = new Error('Invalid filename for this property')
        error.statusCode = 400
        throw error
    }

    return finalFileName
}

export { createToken, getPropertiesList, getPropertyDetail, getPropertyImages, getPropertyDocumentImages, getyBriefProperty, generateHTML, generateAllHTML, syncTextsFromWebmegler, openHTMLTemplate, writeHTML, getSavedHTMLTemplates, getSavedHTMLTemplatesGrouped, generatePDF, getToken }