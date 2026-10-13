import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import slugify from 'slugify'
import HtmlTemplate from '../models/htmlTemplate.js'
import { syncPropertyData } from '../helpers/syncWebmegler.js'
import { getToken } from './pdfGenerationController.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MASTER_TEMPLATES_DIR = path.join(__dirname, '../uploads/master-templates')

const ensureMasterTemplatesDir = async () => {
    await fs.promises.mkdir(MASTER_TEMPLATES_DIR, { recursive: true })
}

const buildSlug = (name = '') =>
    slugify(name, { lower: true, strict: true, trim: true })

const createHtmlTemplate = async (req, res) => {
    try {
        const { name, description, html } = req.body

        if (!name || !html) {
            return res.status(400).json({ message: 'Missing Required fields: name, html' })
        }

        const slug = buildSlug(name)
        if (!slug) return res.status(400).json({ message: 'Invalid template name' })

        const existing = await HtmlTemplate.findOne({ slug })
        if (existing) {
            return res.status(409).json({ message: 'A template with this name already exists' })
        }

        await ensureMasterTemplatesDir()

        const fileName = `${slug}.html`
        const filePath = path.join(MASTER_TEMPLATES_DIR, fileName)

        await fs.promises.writeFile(filePath, html)

        const newTemplate = new HtmlTemplate({
            name,
            slug,
            description: description || '',
            fileName,
            filePath: `uploads/master-templates/${fileName}`
        })

        const savedTemplate = await newTemplate.save()

        return res.status(201).json({
            status: true,
            statusCode: 201,
            message: 'HTML template created successfully',
            data: savedTemplate
        })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({
            message: 'Failed to create HTML template',
            error: error.message
        })
    }
}

const getAllHtmlTemplates = async (req, res) => {
    try {
        const filter = {}
        if (req.query.isActive === 'true') filter.isActive = true
        if (req.query.isActive === 'false') filter.isActive = false

        const templates = await HtmlTemplate.find(filter).sort({ createdAt: -1 })

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: 'HTML templates fetched successfully',
            data: templates
        })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({
            message: 'Failed to fetch HTML templates',
            error: error.message
        })
    }
}

const getHtmlTemplateById = async (req, res) => {
    try {
        const { id } = req.params
        const template = await HtmlTemplate.findById(id)
        if (!template) return res.status(404).json({ message: 'HTML template not found' })

        const data = template.toObject()

        if (req.query.includeHtml === 'true') {
            const filePath = path.join(__dirname, '../', template.filePath)
            try {
                data.html = await fs.promises.readFile(filePath, 'utf8')
            } catch {
                data.html = null
            }
        }

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: 'HTML template fetched successfully',
            data
        })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({
            message: 'Failed to fetch HTML template',
            error: error.message
        })
    }
}

const updateHtmlTemplate = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description, html, isActive } = req.body

        const existingTemplate = await HtmlTemplate.findById(id)
        if (!existingTemplate) return res.status(404).json({ message: 'HTML template not found' })

        await ensureMasterTemplatesDir()

        let { fileName, filePath, slug } = existingTemplate

        // Handle rename → new slug/fileName, move file on disk
        if (name && name !== existingTemplate.name) {
            const newSlug = buildSlug(name)
            if (!newSlug) return res.status(400).json({ message: 'Invalid template name' })

            if (newSlug !== slug) {
                const clashing = await HtmlTemplate.findOne({ slug: newSlug, _id: { $ne: id } })
                if (clashing) return res.status(409).json({ message: 'A template with this name already exists' })

                const oldFilePath = path.join(__dirname, '../', filePath)
                const newFileName = `${newSlug}.html`
                const newFilePath = path.join(MASTER_TEMPLATES_DIR, newFileName)

                if (fs.existsSync(oldFilePath)) {
                    await fs.promises.rename(oldFilePath, newFilePath)
                }

                slug = newSlug
                fileName = newFileName
                filePath = `uploads/master-templates/${newFileName}`
            }
        }

        // Handle HTML content update
        if (html) {
            const targetPath = path.join(MASTER_TEMPLATES_DIR, fileName)
            await fs.promises.writeFile(targetPath, html)
        }

        const updatedTemplate = await HtmlTemplate.findByIdAndUpdate(
            id,
            {
                name: name || existingTemplate.name,
                slug,
                fileName,
                filePath,
                description: description !== undefined ? description : existingTemplate.description,
                isActive: isActive !== undefined ? isActive : existingTemplate.isActive
            },
            { new: true, runValidators: true }
        )

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: 'HTML template updated successfully',
            data: updatedTemplate
        })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({
            message: 'Failed to update HTML template',
            error: error.message
        })
    }
}

const deleteHtmlTemplate = async (req, res) => {
    try {
        const { id } = req.params
        const template = await HtmlTemplate.findById(id)
        if (!template) return res.status(404).json({ message: 'HTML template not found' })

        const filePath = path.join(__dirname, '../', template.filePath)
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath)
        }

        await HtmlTemplate.findByIdAndDelete(id)

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: 'HTML template deleted successfully'
        })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({
            message: 'Failed to delete HTML template',
            error: error.message
        })
    }
}

const generateHtmlFromTemplate = async (req, res) => {
    try {
        const propertyId = req.params.propertyId
        const { templateId } = req.body

        if (!propertyId || !templateId) {
            return res.status(400).json({ message: 'Missing Required fields: propertyId, templateId' })
        }

        const template = await HtmlTemplate.findById(templateId)
        if (!template) return res.status(404).json({ message: 'HTML template not found' })
        if (!template.isActive) return res.status(400).json({ message: 'This HTML template is inactive' })

        const token = await getToken()
        if (!token) return res.status(401).json({ message: 'Unauthorized' })

        const templateFilePath = path.join(__dirname, '../', template.filePath)
        const html = await fs.promises.readFile(templateFilePath, 'utf-8')

        const { updatedHtml, changed, skipped } = await syncPropertyData({ propertyId, token, html })

        const propertyDir = path.join(__dirname, '../uploads/properties-html', propertyId)
        await fs.promises.mkdir(propertyDir, { recursive: true })

        const fileName = `${propertyId}-${template.slug}.html`
        const filePath = path.join(propertyDir, fileName)

        await fs.promises.writeFile(filePath, updatedHtml)

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: 'HTML generated from template successfully',
            updated: changed.length,
            updatedHtml,
            changed,
            skipped,
            path: `uploads/properties-html/${propertyId}/${fileName}`
        })
    } catch (error) {
        console.log('ERROR', error)
        return res.status(500).json({
            message: 'Failed to generate HTML from template',
            error: error.message
        })
    }
}

export {
    createHtmlTemplate,
    getAllHtmlTemplates,
    getHtmlTemplateById,
    updateHtmlTemplate,
    deleteHtmlTemplate,
    generateHtmlFromTemplate
}