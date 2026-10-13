# Lokalmegleren Admin Dashboard

A specialized real estate administration platform for **Lokalmegleren**, designed to manage properties, customize real estate documents through interactive template editors, and export publication-ready materials as standard PDFs and booklet-view PDFs.

---

## Core Concepts

- **Real Estate Document & Publication Workflow:** Centralized management of property content (`Boligstoff`), interactive template-based document editing, and automated generation of standard PDFs as well as paginated two-page spread booklet PDFs.
- **Server State Synchronization & Query Invalidation:** Asynchronous data retrieval using TanStack React Query (`useReactQuery`, `useApiMutation`) with granular cache invalidation (`queryClient.invalidateQueries`) after successful mutations.
- **Server-Side Operations:** Server-side transaction handling through Next.js Server Actions with path-based revalidation using `revalidatePath`.
- **Concurrent UI Transitions:** Smooth, non-blocking modal submissions and asynchronous mutations using React's `useTransition` and `startTransition` hooks.
- **Contextual Schema Validation:** Form management using React Hook Form and Zod, including contextual validation with `.superRefine()` to verify phone number length against selected country dial codes.
- **Multilingual Routing:** Internationalized routing using the `/[locale]/...` structure, powered by `next-intl` translation hooks and routing utilities.
- **Drag-and-Drop Pipeline:** Event-driven column and task reordering using `@dnd-kit` sensors, collision detection, and sortable contexts.

---

## Technologies Used

- **Next.js** — App Router and Server Actions
- **TypeScript**
- **Tailwind CSS** — Styling with `next-themes` dark/light mode integration
- **TanStack React Query** (`@tanstack/react-query`)
- **TanStack Table** (`@tanstack/react-table`)
- **React Hook Form** and **Zod** (`@hookform/resolvers/zod`)
- **Radix UI Primitives** — Dialog, Dropdown Menu, Context Menu, Collapsible, Avatar, Tooltip, and Hover Card
- **FullCalendar** — React, day grid, time grid, interaction, and list views
- **@dnd-kit** — Core, sortable, and utilities
- **next-intl** — Internationalization and localized routing
- **Embla Carousel** — Autoplay
- **React Select** (`react-select`)
- **date-fns**
- **Lucide React** and **Iconify**
- **Emoji Mart** (`@emoji-mart/react`, `@emoji-mart/data`)

---

## Key Pages

### Admin (`/admin`)

- **Role & User Management:** Administrator directory with paginated tables and multi-field search across staff profiles.
- **Staff Management Modals:** Add and edit administrator accounts using Zod validation and dynamic country-code phone formatting.

### Eiendommer (Properties)

- **Listing Hub:** Manage housing data, unit specifications, descriptions, and media assets (`Boligstoff`).
- **Broker Operations:** Organize active properties and link property data directly to sales documentation.

### Templates

- **Layout Configurations:** Manage standardized formats, including marketing flyers, sales prospectuses, and multi-page brochures.
- **Branding Rules:** Define dynamic placeholders, text styles, color palettes, and structured sections to keep real estate materials on-brand.

### Rediger (Template & Document Editor)

- **Interactive Customizer:** Adapt predefined templates to individual property listings.
- **Content Editing:** Edit property text, image placement, section arrangements, and broker details with a dynamic preview.

### PDF Viewer (PDF & Booklet View)

- **Digital & Print Previews:** Inspect documents using continuous scrolling or two-page booklet spreads.
- **Export & Distribution:** Generate high-resolution PDFs for printing and client delivery.

---

## Installation Guide

### Prerequisites

Install the following before setting up the project:

- **Node.js:** Use a version supported by your project's Next.js version. Check the [Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation) for current requirements.
- **npm:** Included with Node.js. You can also use your project's existing package manager (Yarn, pnpm, or Bun).
- **Git:** Required if you are cloning the repository.

Check your installed versions:

```bash
node -v
npm -v
git --version
```

### 1. Clone the Repository

Replace `<repository-url>` with the actual Git repository URL:

```bash
git clone <repository-url>
cd lokalmegleren-Admin
```

If you already have the source code on your computer, open a terminal in the project directory instead.

### 2. Install Dependencies

Install the dependencies listed in `package.json`:

```bash
npm install
```

If the project uses `package-lock.json`, `npm ci` can be used for a clean, reproducible install:

```bash
npm ci
```

Use either `npm install` or `npm ci`, not both in succession. If the repository uses a different package manager, follow its lockfile and project instructions.

### 3. Configure Environment Variables

Check the project for `.env.example` or setup instructions. If an example file exists, copy it to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Add the actual environment variables required by the application, such as API URLs or authentication settings. **Do not commit `.env.local` or secrets to Git.** If the project does not have an `.env.example`, ask the project maintainer which variables are required.

### 4. Start the Development Server

Run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

Create an optimized production build:

```bash
npm run build
```

If the build completes successfully, start the production server:

```bash
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to check the production build locally.

### Available Scripts

The scripts below are common in Next.js projects. Confirm the actual commands in your `package.json`:

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Run the production server |
| `npm run lint` | Run lint checks, if configured |

---

## Project Structure

```text
lokalmegleren-Admin/
├── action/                      # Next.js Server Actions (auth, app actions)
├── app/
│   └── [locale]/                # Localized route segments (e.g. en, no)
│       ├── (auth)/              # Authentication screens (login, register)
│       └── (protected)/         # Authenticated admin routes
│           ├── admin/           # Admin account directory and modals
│           ├── adminrole/       # Admin roles and permissions
│           ├── admin-profile/   # Admin profile management
│           ├── boligstoff/      # Property management
│           ├── app/              # Communication and task workspace
│           │   ├── calendar/    # Calendar planner and event modals
│           │   ├── chat/        # Messaging interface
│           │   ├── email/       # Webmail client
│           │   ├── kanban/      # Draggable Kanban boards
│           │   ├── projects/    # Projects grid and table views
│           │   └── todo/        # Task tracker
│           ├── blocks/          # Statistics and widgets
│           └── components/      # UI component catalog and previews
├── components/
│   ├── ui/                      # Reusable UI primitives
│   └── tablereusable.tsx        # Reusable TanStack data table
├── hooks/                       # Custom hooks for queries, mutations, and layout
├── services/                    # API endpoints and network configuration
├── utils/                       # Validation helpers and phone-number utilities
├── public/                      # Static assets, icons, and avatars
├── package.json                 # Dependencies and npm scripts
└── README.md                    # Project documentation
```

> This structure reflects the directories supplied in the project overview. Some files or folders may differ in the actual repository.

---

## Project Purpose

The Lokalmegleren Admin Dashboard brings property management, staff administration, template customization, and PDF publication workflows into one platform. It helps real estate teams manage property information, maintain consistent branding, and prepare professional sales materials for digital distribution and print.
