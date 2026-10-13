import Boligstoff from '../models/boligstoff.js'
import Personvern from '../models/personvern.js'
import Omoss from '../models/omoss.js'
import Vilkaar from '../models/vilkaar.js'
import Ledige from '../models/ledige.js'
import Hjem from '../models/hjem.js'

const createBoligstoff = async (req, res) => {
    try {
        const { order, title, paragraph } = req.body
        if (!title || !paragraph) throw new Error('MISSING_FIELDS')
        const imagePaths = req.files?.map((file) => file.path)
        console.log("FILES", req.files)
        console.log("BODY", req.body);
        const newItem = new Boligstoff({
            order: order,
            images: imagePaths,
            title: title,
            paragraph: Array.isArray(paragraph) ? paragraph : [paragraph]
        })
        const savedBoligstoff = await newItem.save()

        return res.status(201).json({ message: 'Boligstoff created successfully', data: savedBoligstoff })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({
            message: 'Failed to create Boligstoff',
            error: error?.response?.data?.error || error?.response?.statusText,
        })
    }
}

const getAllBoligstoff = async (req, res) => {
    try {
        const boligstoffItems = await Boligstoff.find().sort({ createdAt: -1 })
        if (!boligstoffItems || !boligstoffItems.length) return res.status(200).json({ message: 'No Boligstoff items found' })

        return res.status(200).json({ message: 'Boligstoff items fetched successfully', data: boligstoffItems })
    } catch (error) {
        console.log("ERROR", error);
        return res.status(500).json({
            message: 'Failed to fetch Boligstoff',
            error: error?.response?.data?.error || error?.response?.statusText,
        })
    }
}

const getBoligstoffById = async (req, res) => {
    try {
        const { id } = req.params
        const item = await Boligstoff.findById(id)
        if (!item) return res.status(200).json({ message: 'Boligstoff item not found' })

        return res.status(200).json({ message: 'Boligstoff item fetched successfully', data: item })
    } catch (error) {
        console.log("ERROR", error)
        return res.status(500).json({
            message: 'Failed to fetch Boligstoff item',
            error: error?.response?.data?.error || error?.response?.statusText,
        })
    }
}

const updateBoligstoff = async (req, res) => {
    try {
        const { id } = req.params
        const { order, title, paragraph } = req.body

        const existingItem = await Boligstoff.findById(id)
        if (!existingItem) return res.status(404).json({ message: 'Boligstoff item not found' })

        // If new images are uploaded use them, otherwise keep the existing ones
        const imagePaths = req.files?.length
            ? req.files.map((file) => file.path)
            : existingItem.images

        const updatedItem = await Boligstoff.findByIdAndUpdate(
            id,
            {
                order: order || existingItem.order,
                title: title || existingItem.title,
                paragraph: paragraph
                    ? Array.isArray(paragraph) ? paragraph : [paragraph]
                    : existingItem.paragraph,
                images: imagePaths
            },
            { new: true, runValidators: true }
        )

        return res.status(200).json({ message: 'Boligstoff updated successfully', data: updatedItem })
    } catch (error) {
        console.log("ERROR", error)
        return res.status(500).json({
            message: 'Failed to update Boligstoff',
            error: error?.response?.data?.error || error?.response?.statusText,
        })
    }
}

const deleteBoligstoff = async (req, res) => {
    try {
        const { id } = req.params

        const deletedItem = await Boligstoff.findByIdAndDelete(id)
        if (!deletedItem) return res.status(404).json({ message: 'Boligstoff item not found' })

        return res.status(200).json({ message: 'Boligstoff deleted successfully', data: deletedItem })
    } catch (error) {
        console.log("ERROR", error)
        return res.status(500).json({
            message: 'Failed to delete Boligstoff',
            error: error?.response?.data?.error || error?.response?.statusText,
        })
    }
}

// personvern
const createPersonvern = async (req, res) => {
    try {
        const { order, title, p1, p2, li, address } = req.body

        if (!order || !title) {
            return res.status(400).json({ message: 'Missing required fields: order, title' })
        }

        const newSection = new Personvern({
            order,
            title,
            p1: p1 || null,
            p2: p2 || null,
            li: li || [],
            address: address || []
        })

        const saved = await newSection.save()
        return res.status(201).json({ message: 'Personvern section created successfully', data: saved })
    } catch (error) {
        console.log('ERROR', error)
        if (error.code === 11000) {
            return res.status(409).json({ message: `A section with order ${req.body.order} already exists` })
        }
        return res.status(500).json({ message: 'Failed to create Personvern section', error: error?.message })
    }
}

const getAllPersonvern = async (req, res) => {
    try {
        const sections = await Personvern.find().sort({ order: 1 })
        if (!sections || !sections.length) {
            return res.status(200).json({ message: 'No Personvern sections found' })
        }
        return res.status(200).json({ message: 'Personvern sections fetched successfully', data: sections })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to fetch Personvern sections', error: error?.message })
    }
}

// GET BY ID
const getPersonvernById = async (req, res) => {
    try {
        const { id } = req.params
        const section = await Personvern.findById(id)
        if (!section) {
            return res.status(200).json({ message: 'Personvern section not found' })
        }
        return res.status(200).json({ message: 'Personvern section fetched successfully', data: section })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to fetch Personvern section', error: error?.message })
    }
}

// UPDATE
const updatePersonvern = async (req, res) => {
    try {
        const { id } = req.params
        const { order, title, p1, p2, li, address } = req.body

        const existingSection = await Personvern.findById(id)
        if (!existingSection) {
            return res.status(404).json({ message: 'Personvern section not found' })
        }

        const updatedSection = await Personvern.findByIdAndUpdate(
            id,
            {
                order: order ?? existingSection.order,
                title: title || existingSection.title,
                p1: p1 !== undefined ? p1 : existingSection.p1,
                p2: p2 !== undefined ? p2 : existingSection.p2,
                li: li !== undefined ? li : existingSection.li,
                address: address !== undefined ? address : existingSection.address
            },
            { new: true, runValidators: true }
        )

        return res.status(200).json({ message: 'Personvern section updated successfully', data: updatedSection })
    } catch (error) {
        console.log('ERROR', error)
        if (error.code === 11000) {
            return res.status(409).json({ message: `A section with order ${req.body.order} already exists` })
        }
        return res.status(500).json({ message: 'Failed to update Personvern section', error: error?.message })
    }
}

// DELETE
const deletePersonvern = async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await Personvern.findByIdAndDelete(id)
        if (!deleted) {
            return res.status(404).json({ message: 'Personvern section not found' })
        }
        return res.status(200).json({ message: 'Personvern section deleted successfully', data: deleted })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to delete Personvern section', error: error?.message })
    }
}

// omoss
const createOmoss = async (req, res) => {
    try {
        const { order, title, li } = req.body

        if (!order || !title || !li || !li.length) return res.status(400).json({ message: 'Missing required fields: order, title, li' })

        const newBlock = new Omoss({
            order,
            title,
            li: Array.isArray(li) ? li : [li]
        })

        const saved = await newBlock.save()
        return res.status(201).json({ message: 'Om oss block created successfully', data: saved })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to create Om oss block', error: error?.message })
    }
}

const getAllOmoss = async (req, res) => {
    try {
        const blocks = await Omoss.find().sort({ order: 1 })
        if (!blocks || !blocks.length) {
            return res.status(200).json({ message: 'No Om oss blocks found' })
        }
        return res.status(200).json({ message: 'Om oss blocks fetched successfully', data: blocks })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to fetch Om oss blocks', error: error?.message })
    }
}

// GET BY ID
const getOmossById = async (req, res) => {
    try {
        const { id } = req.params
        const block = await Omoss.findById(id)
        if (!block) {
            return res.status(200).json({ message: 'Om oss block not found' })
        }
        return res.status(200).json({ message: 'Om oss block fetched successfully', data: block })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to fetch Om oss block', error: error?.message })
    }
}

// UPDATE
const updateOmoss = async (req, res) => {
    try {
        const { id } = req.params
        const { order, title, li } = req.body

        const existingBlock = await Omoss.findById(id)
        if (!existingBlock) {
            return res.status(404).json({ message: 'Om oss block not found' })
        }

        const updatedBlock = await Omoss.findByIdAndUpdate(
            id,
            {
                order: order ?? existingBlock.order,
                title: title || existingBlock.title,
                li: li !== undefined ? (Array.isArray(li) ? li : [li]) : existingBlock.li
            },
            { new: true, runValidators: true }
        )

        return res.status(200).json({ message: 'Om oss block updated successfully', data: updatedBlock })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to update Om oss block', error: error?.message })
    }
}

// DELETE
const deleteOmoss = async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await Omoss.findByIdAndDelete(id)
        if (!deleted) {
            return res.status(404).json({ message: 'Om oss block not found' })
        }
        return res.status(200).json({ message: 'Om oss block deleted successfully', data: deleted })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to delete Om oss block', error: error?.message })
    }
}

const createVilkaar = async (req, res) => {
    try {
        const { order, title, p1, p2, li } = req.body

        if (!order || !title) {
            return res.status(400).json({ message: 'Missing required fields: order, title' })
        }

        const newSection = new Vilkaar({
            order,
            title,
            p1: p1 || null,
            p2: p2 || null,
            li: li || []
        })

        const saved = await newSection.save()
        return res.status(201).json({ message: 'Vilkaar section created successfully', data: saved })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to create Vilkaar section', error: error?.message })
    }
}

// GET ALL
const getAllVilkaar = async (req, res) => {
    try {
        const sections = await Vilkaar.find().sort({ order: 1 })
        if (!sections || !sections.length) {
            return res.status(200).json({ message: 'No Vilkaar sections found' })
        }
        return res.status(200).json({ message: 'Vilkaar sections fetched successfully', data: sections })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to fetch Vilkaar sections', error: error?.message })
    }
}

// GET BY ID
const getVilkaarById = async (req, res) => {
    try {
        const { id } = req.params
        const section = await Vilkaar.findById(id)
        if (!section) {
            return res.status(200).json({ message: 'Vilkaar section not found' })
        }
        return res.status(200).json({ message: 'Vilkaar section fetched successfully', data: section })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to fetch Vilkaar section', error: error?.message })
    }
}

// UPDATE
const updateVilkaar = async (req, res) => {
    try {
        const { id } = req.params
        const { order, title, p1, p2, li } = req.body

        const existingSection = await Vilkaar.findById(id)
        if (!existingSection) {
            return res.status(404).json({ message: 'Vilkaar section not found' })
        }

        const updatedSection = await Vilkaar.findByIdAndUpdate(
            id,
            {
                order: order ?? existingSection.order,
                title: title || existingSection.title,
                p1: p1 !== undefined ? p1 : existingSection.p1,
                p2: p2 !== undefined ? p2 : existingSection.p2,
                li: li !== undefined ? li : existingSection.li
            },
            { new: true, runValidators: true }
        )

        return res.status(200).json({ message: 'Vilkaar section updated successfully', data: updatedSection })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to update Vilkaar section', error: error?.message })
    }
}

// DELETE
const deleteVilkaar = async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await Vilkaar.findByIdAndDelete(id)
        if (!deleted) {
            return res.status(404).json({ message: 'Vilkaar section not found' })
        }
        return res.status(200).json({ message: 'Vilkaar section deleted successfully', data: deleted })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to delete Vilkaar section', error: error?.message })
    }
}

const createLedige = async (req, res) => {
    try {
        const { order, head, p, detailTitle, contact } = req.body

        if (!order || !head || !p) {
            return res.status(400).json({ message: 'Missing required fields: order, head, p' })
        }

        const image = req.files?.['image']?.[0]?.path
        const detailImage = req.files?.['detailImage']?.[0]?.path

        if (!image) return res.status(400).json({ message: 'Card image is required' })

        const newLedige = new Ledige({
            order,
            image,
            head,
            p,
            detailImage: detailImage || null,
            detailTitle: detailTitle || null,
            contact: contact || null,
            sections: []           // empty at creation
        })

        const saved = await newLedige.save()
        return res.status(201).json({ message: 'Ledige created successfully', data: saved })
    } catch (error) {
        console.log('ERROR', error)
        if (error.code === 11000) {
            return res.status(409).json({ message: `Order ${req.body.order} already exists` })
        }
        return res.status(500).json({ message: 'Failed to create Ledige', error: error?.message })
    }
}


const updateSections = async (req, res) => {
    try {
        const { id } = req.params
        const { sections } = req.body

        if (!sections || !Array.isArray(sections)) {
            return res.status(200).json({ message: 'sections array is required' })
        }

        const updated = await Ledige.findByIdAndUpdate(
            id,
            { sections },
            { new: true, runValidators: true }
        )

        if (!updated) return res.status(404).json({ message: 'Ledige item not found' })
        return res.status(200).json({ message: 'Sections updated successfully', data: updated })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to update sections', error: error?.message })
    }
}

// GET ALL — listing page (returns everything, frontend picks what to show)
const getAllLedige = async (req, res) => {
    try {
        const items = await Ledige.find().sort({ order: 1 })
        if (!items || !items.length) {
            return res.status(200).json({ message: 'No Ledige items found' })
        }
        return res.status(200).json({ message: 'Ledige items fetched successfully', data: items })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to fetch Ledige items', error: error?.message })
    }
}

// GET BY ID — detail page when "Les mer" is clicked
const getLedigeById = async (req, res) => {
    try {
        const { id } = req.params
        const item = await Ledige.findById(id)
        if (!item) return res.status(200).json({ message: 'Ledige item not found' })
        return res.status(200).json({ message: 'Ledige item fetched successfully', data: item })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to fetch Ledige item', error: error?.message })
    }
}

// UPDATE
const updateLedige = async (req, res) => {
    try {
        const { id } = req.params
        const { order, head, p, detailTitle, contact } = req.body

        const existing = await Ledige.findById(id)
        if (!existing) return res.status(404).json({ message: 'Ledige item not found' })

        const image = req.files?.['image']?.[0]?.path || existing.image
        const detailImage = req.files?.['detailImage']?.[0]?.path || existing.detailImage

        const updated = await Ledige.findByIdAndUpdate(
            id,
            {
                order: order ?? existing.order,
                image,
                detailImage,
                head: head || existing.head,
                p: p || existing.p,
                detailTitle: detailTitle !== undefined ? detailTitle : existing.detailTitle,
                contact: contact !== undefined ? contact : existing.contact
            },
            { new: true, runValidators: true }
        )

        return res.status(200).json({ message: 'Ledige updated successfully', data: updated })
    } catch (error) {
        console.log('ERROR', error)
        if (error.code === 11000) {
            return res.status(409).json({ message: `Order ${req.body.order} already exists` })
        }
        return res.status(500).json({ message: 'Failed to update Ledige', error: error?.message })
    }
}

// DELETE
const deleteLedige = async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await Ledige.findByIdAndDelete(id)
        if (!deleted) return res.status(404).json({ message: 'Ledige item not found' })
        return res.status(200).json({ message: 'Ledige deleted successfully', data: deleted })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to delete Ledige', error: error?.message })
    }
}

// CREATE
const createHome = async (req, res) => {
    try {
        const existing = await Hjem.findOne()
        if (existing) {
            return res.status(409).json({ message: 'Homepage already exists, use PUT to update' })
        }

        const { banner, contactUs, aboutUs } = req.body

        if (!banner?.title || !contactUs?.title) {
            return res.status(400).json({ message: 'Missing required fields: banner.title, contactUs.title' })
        }

        const image = req.file?.path
        if (!image) return res.status(400).json({ message: 'Banner image is required' })

        const newHome = new Hjem({
            banner: {
                title: banner.title,
                image,
                disc: banner.disc || []
            },
            contactUs: {
                title: contactUs.title,
                data: contactUs.data || []
            },
            aboutUs: aboutUs || []
        })

        const saved = await newHome.save()
        return res.status(201).json({ message: 'Homepage created successfully', data: saved })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to create homepage', error: error?.message })
    }
}

// GET
const getHome = async (req, res) => {
    try {
        const home = await Hjem.findOne()
        if (!home) return res.status(200).json({ message: 'Homepage not found' })
        return res.status(200).json({ message: 'Homepage fetched successfully', data: home })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to fetch homepage', error: error?.message })
    }
}

// UPDATE — one PUT handles everything
const updateHome = async (req, res) => { 
    try {
        const home = await Hjem.findOne()
        if (!home) return res.status(404).json({ message: 'Homepage not found' })

        const { banner, contactUs, aboutUs } = req.body
        const image = req.file?.path || home.banner.image

        const updated = await Hjem.findByIdAndUpdate(
            home._id,
            {
                banner: {
                    title: banner?.title !== undefined ? banner.title : home.banner.title,
                    image,
                    disc: banner?.disc !== undefined ? banner.disc : home.banner.disc
                },
                contactUs: {
                    title: contactUs?.title !== undefined ? contactUs.title : home.contactUs.title,
                    data: contactUs?.data !== undefined ? contactUs.data : home.contactUs.data
                },
                aboutUs: aboutUs !== undefined ? aboutUs : home.aboutUs
            },
            { new: true }
        )

        return res.status(200).json({ message: 'Homepage updated successfully', data: updated })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to update homepage', error: error?.message })
    }
}

// DELETE
const deleteHome = async (req, res) => {
    try {
        const deleted = await Hjem.findOneAndDelete()
        if (!deleted) return res.status(404).json({ message: 'Homepage not found' })
        return res.status(200).json({ message: 'Homepage deleted successfully', data: deleted })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({ message: 'Failed to delete homepage', error: error?.message })
    }
}


export {
    createBoligstoff,
    getAllBoligstoff,
    getBoligstoffById,
    updateBoligstoff,
    deleteBoligstoff,
    createPersonvern,
    getAllPersonvern,
    getPersonvernById,
    updatePersonvern,
    deletePersonvern,
    createOmoss,
    getAllOmoss,
    getOmossById,
    updateOmoss,
    deleteOmoss,
    createVilkaar,
    getAllVilkaar,
    getVilkaarById,
    updateVilkaar,
    deleteVilkaar,
    createLedige,
    updateSections,
    getAllLedige,
    getLedigeById,
    updateLedige,
    deleteLedige,
    createHome,
    getHome,
    updateHome,
    deleteHome
}