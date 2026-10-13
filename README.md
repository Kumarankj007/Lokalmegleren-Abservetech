# Lokalmegleren Backend API

The Lokalmegleren Backend is a Node.js application that serves as the core data and document processing engine for the Lokalmegleren real estate platform. It handles data synchronization with external property databases, manages dynamic content for the frontend, and powers a template-driven PDF generation system.

---

## Core Concepts & Features

- **External Data Synchronization:** Integrates directly with the Webmegler system to fetch and synchronize external property listings utilizing dedicated execution scripts (`syncWebmegler.js`, `sync-text-from-webmegler.js`) and controllers (`webmeglerController.js`, `webmeglerRoute.js`).
- **PDF Document Engine:** Compiles property data into publication-ready documents using a dedicated `pdfGenerationController.js` paired with EJS server-side rendering (`property-template.ejs`).
- **Template Management:** Stores and manages configurable HTML templates used by the PDF engine (`htmlTemplateController.js`, `htmlTemplate.js` model).
- **Dynamic Content Management (CMS):** Exposes APIs to manage site content via `dynamicPagesController.js`. Features specific database models for properties (`boligstoff`), homepage (`hjem`), available units (`ledige`), about us (`omoss`), privacy policy (`personvern`), and terms (`vilkaar`).
- **Data Sanitization:** Includes a specialized helper (`fixMojibake.js`) to correct character encoding issues (Mojibake), ensuring Norwegian characters render correctly after external synchronization.
- **Authentication & Communications:** Secures API endpoints using `authMiddleware.js` and handles outbound email notifications via `smtpController.js`.

---

## Technologies Used

- **Node.js** — Core runtime environment
- **Express.js** — API routing and middleware architecture (implied by the `app.js`, `controllers/`, `routes/`, and `middlewares/` structure)
- **MongoDB & Mongoose** — Data modeling for dynamic content (implied by the `models/` directory)
- **EJS** — Embedded JavaScript templating for PDF document views (`views/property-template.ejs`)
- **ESLint & Prettier** — Code quality and standardized formatting (`eslint.config.js`, `.prettierrc.json`)

---

## Project Structure

```text
lokalmegleren-Backend/
├── controllers/                   # Request handling and business logic
│   ├── adminController.js         # Admin account management operations
│   ├── dynamicPagesController.js  # CMS data handlers
│   ├── htmlTemplateController.js  # Template selection and updates
│   ├── pdfGenerationController.js # PDF rendering logic
│   ├── smtpController.js          # Email dispatch configurations
│   ├── sync-text-from-webmegler.js# Webmegler text data processor
│   └── webmeglerController.js     # Webmegler integration endpoints
├── helpers/                       # Utility functions
│   ├── fixMojibake.js             # Character encoding repair tool
│   └── syncWebmegler.js           # Sync execution scripts
├── middlewares/                   # Request interception and verification
│   └── authMiddleware.js          # Authentication and token validation
├── models/                        # Database schemas
│   ├── admin.js                   # Administrator credentials
│   ├── boligstoff.js              # Property and real estate data
│   ├── hjem.js                    # Homepage content
│   ├── htmlTemplate.js            # Stored document templates
│   ├── ledige.js                  # Available listings/vacancies
│   ├── omoss.js                   # About Us content
│   ├── personvern.js              # Privacy policy content
│   └── vilkaar.js                 # Terms and conditions content
├── routes/                        # API endpoint definitions
│   └── webmeglerRoute.js          # Webmegler synchronization routes
├── views/                         # Server-side view templates
│   └── property-template.ejs      # EJS layout for PDF property brochures
├── app.js                         # Application entry point and server setup
├── eslint.config.js               # ESLint rules
├── package.json                   # Dependency definitions and scripts
├── settings.json                  # Application configuration
└── .prettierrc.json               # Prettier formatting rules

# Install project dependencies
npm install

# Create environment configuration file
cat << 'EOF' > .env
PORT=5000
MONGODB_URI=
JWT_SECRET=your_super_secret_jwt_key

# Webmegler API Credentials
WEBMEGLER_API_URL=
WEBMEGLER_API_KEY=your_webmegler_key

# SMTP Credentials
SMTP_HOST=smtp.yourmail.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_email_password
EOF