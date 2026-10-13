# Lokalmegleren Frontend

A modern real estate frontend application for **Lokalmegleren**, built with [Next.js](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/). The platform provides an intuitive, high-performance interface for viewing real estate listings, interacting with property templates, and viewing or exporting single and booklet PDF documents.

---

## Table of Contents

- [Technologies Used](#technologies-used)
- [Core Concepts](#core-concepts)
- [Key Pages & Workflows](#key-pages--workflows)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Technologies Used

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (`next.config.ts`, `next-env.d.ts`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with PostCSS (`postcss.config.mjs`)
- **Typography & Fonts**: Self-hosted Google Fonts (`Outfit`, `Poppins`, `Roboto`, `Alata`)
- **Linting & Code Quality**: [ESLint](https://eslint.org/) (`eslint.config.mjs`)

---

## Core Concepts

- **Real Estate Presentation**: Delivering optimized, broker-branded presentations for listings and real estate assets (`Boligstoff`).
- **Document Customization & Templates**: Rendering interactive document templates for property prospectuses, brochures, and sales sheets.
- **Dual-Mode PDF Rendering**: Viewing, previewing, and downloading property documents in both standard single-page view and spread-based booklet view.
- **Component-Driven Styling**: Design system leveraging custom typography (`Alata`, `Outfit`, `Poppins`, `Roboto`) and responsive layouts using Tailwind CSS.

---

## Key Pages & Workflows

| Route | Description |
| --- | --- |
| `/eiendommer` | Displays public and client-facing real estate properties, unit details, key specs, and linked media assets. |
| `/templates` | Interface to browse and select standardized real estate publication templates (flyers, brochures, prospectuses). |
| `/rediger` | Customizer enabling brokers and agents to adapt templates to specific properties, configure text blocks, adjust image layouts, and verify branding. |
| `/pdf-viewer` | Interactive preview tool featuring standard continuous scroll and two-page spread booklet presentations, with high-resolution PDF download capabilities. |

---

## Project Structure

```text
lokalmegleren-Frontend/
├── .vscode/               # Editor and workspace settings
├── public/                # Static public assets
│   ├── assets/            # Embedded font families (Alata, Outfit, Poppins, Roboto)
│   ├── logo.png           # Brand identity assets
│   └── logo-lokalDark.png # Dark-mode variant branding
├── eslint.config.mjs      # ESLint configuration
├── next.config.ts         # Next.js compiler and build configuration
├── package.json           # Project dependencies and script declarations
├── postcss.config.mjs     # PostCSS asset transformation configuration
└── tsconfig.json          # TypeScript compiler configuration
```

---

## Prerequisites

Ensure the following tools are installed on your machine before proceeding:

- **Node.js** `>= 18.17.0` (LTS recommended — Node 20.x)
- **npm** `>= 9.x` (or **yarn** / **pnpm** / **bun**)
- **Git** for cloning the repository

Verify your environment:

```bash
node -v
npm -v
```

---

## Installation

1. **Install dependencies**

   Using npm:

   ```bash
   npm install
   ```

   Using yarn:

   ```bash
   yarn install
   ```

   Using pnpm:

   ```bash
   pnpm install
   ```

2. **Configure environment variables**

   Copy the example environment file and update it with your own values:

   ```bash
   cp .env.example .env.local
   ```

   See [Environment Variables](#environment-variables) for the required keys.

3. **Run the development server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env.local` file in the project root. The following variables are typically required:

```env
# Public API endpoint for fetching properties and templates
NEXT_PUBLIC_API_URL=

# PDF rendering / export service endpoint
NEXT_PUBLIC_PDF_SERVICE_URL=

# Internal secret for server-side API routes (do not expose to the client)
API_SECRET_KEY=your-secret-key-here

# Node environment
NODE_ENV=development
```

> ⚠️ **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never store sensitive secrets in them.

---

## Running the Application

### Development

```bash
npm run dev
```

Runs Next.js in development mode with hot reload at `http://localhost:3000`.

### Linting

```bash
npm run lint
```

Runs ESLint across the project.

### Type Checking

```bash
npx tsc --noEmit
```

Validates TypeScript types without emitting files.

---

## Building for Production

1. **Create an optimized production build**

   ```bash
   npm run build
   ```

2. **Start the production server locally**

   ```bash
   npm run start
   ```

   The production server will start on `http://localhost:3000` by default.

---

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server with hot reload. |
| `npm run build` | Compile the application for production. |
| `npm run start` | Start the production server (requires a prior build). |
| `npm run lint` | Run ESLint checks across the codebase. |

---

## Troubleshooting

| Issue | Solution |
| --- | --- |
| `Module not found` errors | Delete `node_modules` and `package-lock.json`, then run `npm install` again. |
| Port `3000` already in use | Run `npm run dev -- -p 3001` to use a different port. |
| Fonts not loading | Confirm the `public/assets/` folder is intact and font files are referenced correctly in `layout.tsx`. |
| PDF viewer blank | Verify `NEXT_PUBLIC_PDF_SERVICE_URL` is set and reachable from the browser. |

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Commit your changes: `git commit -m "feat: add your feature"`
3. Push the branch: `git push origin feature/your-feature-name`
4. Open a Pull Request against `main`.

Please ensure `npm run lint` and `npx tsc --noEmit` both pass before submitting.

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS.