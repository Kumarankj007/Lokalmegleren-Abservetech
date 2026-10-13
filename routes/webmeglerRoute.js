import express from 'express'
import multer from 'multer'
import path from 'path'
import { authorize } from '../middlewares/authMiddleware.js'
import {
  createToken,
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
  /* propertyList, */
} from '../controllers/webmeglerController.js'
import {
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
} from '../controllers/dynamicPagesController.js'
import { loginAdmin, registerAdmin, getAdminProfile, getAllAdmins, getAdminById, updateAdminProfile, deleteAdminProfile } from '../controllers/adminController.js'
import { getPropertiesList, getPropertyDetail, getPropertyImages, getPropertyDocumentImages, getyBriefProperty, generateHTML, generateAllHTML, syncTextsFromWebmegler, openHTMLTemplate, writeHTML, getSavedHTMLTemplates, getSavedHTMLTemplatesGrouped, generatePDF } from '../controllers/pdfGenerationController.js'
import { createHtmlTemplate, getAllHtmlTemplates, getHtmlTemplateById, updateHtmlTemplate, deleteHtmlTemplate, generateHtmlFromTemplate} from '../controllers/htmlTemplateController.js'

const Router = express.Router()

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`)
  }
})

let imageUpload = multer({
  storage,
  limits: { files: 10 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true)
    } else {
      cb(new Error('Images only'))
    }
  }
})

// Auth Routes
Router.route('/auth/admin/register').post(registerAdmin)
Router.route('/auth/admin/login').post(loginAdmin)
// Admin Profile Routes
Router.route('/admin/profile/me').get(authorize(['ADMIN']), getAdminProfile)
Router.route('/admins').get(authorize(['ADMIN']), getAllAdmins)
Router.route('/admin/:adminId').get(authorize(['ADMIN']), getAdminById)
Router.route('/admin/:adminId').put(authorize(['ADMIN']), updateAdminProfile)
Router.route('/admin/:adminId').delete(authorize(['ADMIN']), deleteAdminProfile)

// PDF Generation Routes
Router.route('/webmegler/pdf/properties').get(authorize(['ADMIN']), getPropertiesList)
Router.route('/webmegler/pdf/property-detail').get(authorize(['ADMIN']), getPropertyDetail)
Router.route('/webmegler/pdf/property-images').get(authorize(['ADMIN']), getPropertyImages)
Router.route('/webmegler/pdf/document-images').get(authorize(['ADMIN']), getPropertyDocumentImages)
Router.route('/webmegler/pdf/property-brief').get(authorize(['ADMIN']), getyBriefProperty)
Router.route('/webmegler/html/generate/:propertyId').get(authorize(['ADMIN']), generateHTML)
Router.route('/webmegler/html/generateAll').get(generateAllHTML)
Router.route('/webmegler/html/sync-webmegler-text/:propertyId').post(authorize(['ADMIN']), syncTextsFromWebmegler)
Router.route('/webmegler/html/template-selection/:propertyId').post(/* authorize(['ADMIN']), */ openHTMLTemplate)
Router.route('/webmegler/html/templates/:propertyId').get(authorize(['ADMIN']), getSavedHTMLTemplates)
Router.route('/webmegler/html/templates-grouped').get(/* authorize(['ADMIN']), */ getSavedHTMLTemplatesGrouped)
Router.route('/webmegler/pdf/write-html/:propertyId').post(authorize(['ADMIN']), writeHTML)
Router.route('/webmegler/pdf-generate/:propertyId').get(authorize(['ADMIN']), generatePDF)

// Master HTML Templates
Router.route('/webmegler/html/master-templates')
  .post(authorize(['ADMIN']), createHtmlTemplate)
  .get(authorize(['ADMIN']), getAllHtmlTemplates)

Router.route('/webmegler/html/master-templates/:id')
  .get(authorize(['ADMIN']), getHtmlTemplateById)
  .put(authorize(['ADMIN']), updateHtmlTemplate)
  .delete(authorize(['ADMIN']), deleteHtmlTemplate)

Router.route('/webmegler/html/generate-from-template/:propertyId')
  .post(authorize(['ADMIN']), generateHtmlFromTemplate)

// Webmegler Routes
Router.post('/webmegler/token', createToken)
Router.get('/webmegler/companies/:companyId?', getCompanies)
Router.get('/webmegler/departments/:departmentId?', getDepartments)
Router.get('/webmegler/employees/:employeeId?', getEmployees)
Router.get('/webmegler/employee/profile', getEmployeeProfile)
// Router.get('/webmegler/property/employee', propertyList)
Router.get('/webmegler/properties/employee', propertyListWithEmployees)
Router.get('/webmegler/properties/images/', propertyImages)
Router.get('/webmegler/properties/documents', getDocumentsForProperty)
Router.get('/webmegler/document/:documentId', getDocumentForPropertyById)
Router.get('/webmegler/file/document/:documentId', getFileForDocumentInPDF)
Router.get('/webmegler/properties/linker', getLinkerFileInPDF)
Router.get('/webmegler/properties/visiting/:propertyId?', getTimingForVisit)
Router.get('/webmegler/properties/:propertyId?', getProperties)
Router.get('/webmegler/brief/property', getPropertyBrief)
Router.get('/webmegler/reviews', getReviews)
Router.get('/webmegler/description', getEmployeeDescriptions)
Router.post('/webmegler/contactUs', sendEnquiry)

// Dynamic Pages

// Boligstoff (Housing material)
Router.route('/pages/boligstoff')
  .post(authorize(['ADMIN']), imageUpload.array('images', 10), createBoligstoff)
  .get(getAllBoligstoff)

Router.route('/pages/boligstoff/:id')
  .get(authorize(['ADMIN']), getBoligstoffById)
  .put(authorize(['ADMIN']), imageUpload.array('images', 10), updateBoligstoff)
  .delete(authorize(['ADMIN']), deleteBoligstoff)

// Personvern
Router.route('/pages/personvern')
  .post(authorize(['ADMIN']), createPersonvern)
  .get(getAllPersonvern)

Router.route('/pages/personvern/:id')
  .get(authorize(['ADMIN']), getPersonvernById)
  .put(authorize(['ADMIN']), updatePersonvern)
  .delete(authorize(['ADMIN']), deletePersonvern)

// Omoss
Router.route('/pages/omoss')
  .post(authorize(['ADMIN']), createOmoss)
  .get(getAllOmoss)

Router.route('/pages/omoss/:id')
  .get(authorize(['ADMIN']), getOmossById)
  .put(authorize(['ADMIN']), updateOmoss)
  .delete(authorize(['ADMIN']), deleteOmoss)

// Vilkaar
Router.route('/pages/vilkaar')
  .post(authorize(['ADMIN']), createVilkaar)
  .get(getAllVilkaar)

Router.route('/pages/vilkaar/:id')
  .get(authorize(['ADMIN']), getVilkaarById)
  .put(authorize(['ADMIN']), updateVilkaar)
  .delete(authorize(['ADMIN']), deleteVilkaar)

// Ledige
Router.route('/pages/ledige') 
  .post(authorize(['ADMIN']), imageUpload.fields([ { name: 'image', maxCount: 5 }, { name: 'detailImage', maxCount: 5 }]), createLedige)
  .get(getAllLedige)

Router.route('/pages/ledige/:id/sections')  
  .put(authorize(['ADMIN']), updateSections)

Router.route('/pages/ledige/:id')  
  .get(authorize(['ADMIN']), getLedigeById)
  .put(authorize(['ADMIN']), imageUpload.fields([ { name: 'image', maxCount: 5 }, { name: 'detailImage', maxCount: 5 }]), updateLedige)
  .delete(authorize(['ADMIN']), deleteLedige)

// Hjem
Router.route('/pages/hjem')  
  .post(authorize(['ADMIN']), imageUpload.single('image'), createHome)
  .get(getHome)
  .put(authorize(['ADMIN']), imageUpload.single('image'), updateHome)
  .delete(authorize(['ADMIN']), deleteHome)

export default Router