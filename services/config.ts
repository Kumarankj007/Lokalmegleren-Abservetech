const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001/";
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3002/";

export const APIURLS = {
  baseUrl: BASE_URL.endsWith("/") ? BASE_URL + "api/" : BASE_URL + "/api/",
  frontendUrl: FRONTEND_URL.endsWith("/") ? FRONTEND_URL : FRONTEND_URL + "/",
  imageUrl: BASE_URL,
};

export const APPCONFIG = {
  name: "Lokalmegleren Admin Panel",
  appMode: process.env.NEXT_PUBLIC_MODE || "development",
};

export const APICONSTANT = {
  LOGIN: "auth/admin/login",
  REGISTER: "auth/admin/register",
  PROPERTYLIST: "webmegler/pdf/properties?tenantId=381&employeeId=3000004",
  PROPERTYDETAIL: "webmegler/pdf/property-brief?tenantId=381&propertyId=3000006",
  PROPERTYIMG: "webmegler/pdf/property-images",
  DOCUMENTIMG: "webmegler/pdf/document-images",
  SYNC_WEBMEGLER: "webmegler/html/sync-webmegler-text/",
  GENRATE_HTML: "webmegler/html/generate/",
  GENRATE_ALL_HTML: "webmegler/html/generateAll",
  GET_HTML: "uploads/properties-html/",
  WRITE_HTML: "webmegler/pdf/write-html/",
  GENRATE_PDF: "webmegler/pdf-generate/",
  TEMPLATES: "webmegler/html/templates/",
  OPEN_HTML_TEMPLATE: "webmegler/html/templates-grouped",
  OPEN_HTML_TEMPLATE_FILE: "webmegler/html/template-selection/",

  // Master HTML Templates (CRUD)
  GET_MASTER_TEMPLATES: "webmegler/html/master-templates",
  CREATE_MASTER_TEMPLATE: "webmegler/html/master-templates",
  GET_MASTER_TEMPLATE: "webmegler/html/master-templates/", // + :id  (?includeHtml=true)
  UPDATE_MASTER_TEMPLATE: "webmegler/html/master-templates/", // + :id
  DELETE_MASTER_TEMPLATE: "webmegler/html/master-templates/", // + :id
  GENERATE_FROM_TEMPLATE: "webmegler/html/generate-from-template/", // + :propertyId

  GET_SETTINGS: "api/settings/",
  GET_PROFILE: "auth/admin/profile",
  UPDATE_PROFILE: "auth/admin/update",
  // GET_CAREER: "api/job/careers",
  // GET_JOB: "api/job",
  // GET_INQUERY: "api/contactInquiry/",
  GET_ADMIN: "auth/admin/admins",
  ADD_ADMIN: "auth/admin/register",
  UPDATE_ADMIN: "api/admin/profile",
  GET_ADMINROLE: "api/admin/role",
  GET_ADMINROLETITLE: "api/admin/roles/title",
  GET_ADMINROLEPERMISSIONS: "api/admin/permissions",
  GET_STUDENTS: "admins/admin/users",
  UPDATE_STUDENT_STATUS: "admins/admin/users/status",
  RESET_PASSWORD_STUDENTS: "admins/admin/users/reset-password",
  GET_INSTRUCTORS: "admins/admin/instructors",
  CREATE_INSTRUCTORS: "admins/admin/create-instructor",
  GET_CATEGORY: "admins/category/fetchAll",
  CREATE_CATEGORY: "admins/category/add",
  UPDATE_CATEGORY: "admins/category/update",
  GET_SUBCATEGORY: "admins/subcategory/fetchAll",
  CREATE_SUBCATEGORY: "admins/subcategory/add",
  UPDATE_SUBCATEGORY: "admins/subcategory/update",

  // dashboard:
  GET_DASHBOARD: "admins/dashboard",

  // duration Band:
  GET_DURATION_BANDS: "admins/durationband/fetchAll",
  CREATE_DURATION_BANDS: "admins/durationband/add",
  UPDATE_DURATION_BANDS: "admins/durationband/update",
  ACTIVE_DURATION_BANDS: "admins/durationband/active",

  // duration Band:
  GET_TAGS_BANDS: "admins/tags/fetchAll",
  CREATE_TAGS_BANDS: "admins/tags/add",
  UPDATE_TAGS_BANDS: "admins/tags/update",
  DELETE_TAGS_BANDS: "admins/tags/delete",

  // review course:
  GET_COURSE_ALL: "admins/course/all",
  UPDATE_COURSE_STATUS: "admins/course/status",

  // user review the course
  GET_COURSE_REVIEW: "admins/course/reviews",
  UPDATE_COURSE_REVIEW: "admins/course/review",
  UPDATE_COURSE_DELETE: "admins/course/deleteReview",


  // create course:
  CREATE_COURSE_TITLE: "users/course/add-title",
  CREATE_COURSE_LEARNING: "users/course/learning-outcomes",
  CREATE_COURSE_DESCRIPTION: "users/course/course-description",
  CREATE_COURSE_CURRICULUM: "users/course/course-curriculum",
  CREATE_COURSE_PRICING: "users/course/course-pricing",
  UPLOAD_INTRO_VIDEO: "users/course/upload-lecture-video?type=course-intros",
  UPLOAD_LECTURES_VIDEO: "users/course/upload-lecture-video?type=course-lectures",
  DELETE_COURSE: "users/course/deleteCourse",

  // publish course:
  PUBLISH_COURSE: "users/course/submit",

  // manage course:
  GET_ALL_MANAGE_COURSES: "users/course/my-courses",
  GET_EDIT_COURSES: "users/course/course-details",

  // commissions:
  GET_COMMISSION: "admins/commission/fetch",
  ADD_COMMISSION: "admins/commission/add",
  UPDATE_COMMISSION: "admins/commission/update",

  // commissions override
  ADD_COMMISSION_OVERRIDE: "admins/commission/override/add",
  UPDATE_COMMISSION_OVERRIDE: "admins/commission/override",

  // admin approval queue:
  GET_APPROVAL_LIST: "admins/approval-queue/list",
  UPDATE_APPROVAL_LIST: "admins/approval-queue/update",
  EDIT_AMT_APPROVAL_LIST: "admins/approval-queue/instructor-amt",

  // payout request:
  GET_PAYOUT_REQUESTS: "admins/approval-queue/payouts",
  UPDATE_PAYOUT_STATUS: "admins/approval-queue/payout/update",

  //Transactions
  GET_TRANSACTIONS: "admins/transactions",
  EXPORT_TRANSACTIONS: "admins/transactions/export",

  // privacy
  GET_PERSONVERN: "pages/personvern",
  UPDATE_PERSONVERN: "pages/personvern",
  ADD_PERSONVERN: "pages/personvern",
  DELETE_PERSONVERN: "pages/personvern",

  // Terms & Conditions
  TERMS_ENDPOINT: "pages/vilkaar",

  // About endpoint
  ABOUT_ENDPOINT: "pages/omoss",

  // Boligstoff endpoint
  BOLIGSTOFF_EBDPOINT: "pages/boligstoff",

  // Vacencies
  VACENCY_ENDPOINT: "pages/ledige",

  //HomePage
  HJEM_ENDPOINT: "pages/hjem"

} as const

export type APIKeys = keyof typeof APICONSTANT;