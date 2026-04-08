# GEMINI Instructional Context

This file provides project-specific context and instructions for Gemini CLI.

## Project Overview

- **Name:** my-link (Parent), my-profile (Next.js App)
- **Type:** Next.js Web Application
- **Core Technologies:**
  - **Framework:** Next.js 16.2.2 (App Router)
  - **Library:** React 19.2.4
  - **Styling:** Tailwind CSS 4 (with @tailwindcss/postcss)
  - **Language:** TypeScript
  - **Runtime:** Node.js (suggested)

**Note on Versioning:** The project uses Next.js 16.2.2. As specified in `my-profile/AGENTS.md`, this version may have breaking changes or different conventions compared to standard training data. Always verify API usage against the codebase or internal documentation.

## Project Structure

The main application code is located in the `my-profile` directory:

```text
my-profile/
├── app/            # App Router (Layouts, Pages, Styles)
├── public/         # Static assets
├── next.config.ts  # Next.js configuration
├── package.json    # Dependencies and scripts
└── tsconfig.json   # TypeScript configuration
```

## Building and Running

All commands should be executed within the `my-profile` directory.

- **Development Server:** `npm run dev` (starts on [http://localhost:3000](http://localhost:3000))
- **Build:** `npm run build`
- **Start (Production):** `npm run start`
- **Linting:** `npm run lint`

## Development Conventions

- **Component Structure:** Uses React Server Components (RSC) by default (App Router).
- **Styling:** Utility-first CSS using Tailwind CSS 4. Global styles are in `my-profile/app/globals.css`.
- **Fonts:** Uses Geist and Geist Mono via `next/font/google`.
- **Type Safety:** Strict TypeScript usage is encouraged.
- **Linting:** ESLint with `eslint-config-next`.

## Key Files

- `my-profile/app/layout.tsx`: Root layout with font and metadata configuration.
- `my-profile/app/page.tsx`: Main entry point / home page.
- `my-profile/AGENTS.md`: Critical instructions for AI agents regarding version-specific quirks.
