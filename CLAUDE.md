# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application called "minhaficha-next" (v0.2.1) - a label printing management system for food industry operations. It manages products, labels, operators, printers, and inventory tracking with multi-tenant architecture supporting multiple stores.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production application  
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `next check` - Run Next.js type checking

### Database Types Generation
- `pnpm generate:types` - Generate TypeScript types from Supabase schema
  - Connects to Supabase project ID: 'hnhhoqjmydmdjkvqmidf'
  - Outputs to `src/types/database.types.ts`

## Architecture

### Multi-tenant System
The application uses a multi-tenant architecture where data is automatically filtered by `loja_id` (store ID):
- Store ID is stored in cookies (`minhaficha_loja_id`)
- Supabase client in `src/utils/supabase.ts` automatically adds `loja_id` filters to most operations
- Certain tables bypass this filtering: `loja_usuarios`, `usuarios`, `lojas`, `usuarios_masters`, `impressoras`

### Route Structure
The app uses Next.js 13+ App Router with route groups:
- `(auth)` - Authentication routes (`/auth/login`, `/auth/forgot-password`)
- `(app)` - Main application routes (production, label generation, etc.)
- `(admin)` - Administrative interface with extensive CRUD operations
- `(master)` - Master admin dashboard for managing stores and users

### Key Components

#### Label System
- Label generation and printing using ZPL commands (Zebra Printer Language)
- Template system with visual editor for custom label layouts
- Print queue management with status tracking
- Templates stored in `src/app/(admin)/admin/templates/etiquetas/`

#### Database Integration
- Supabase as backend with PostgreSQL
- Type-safe database operations using generated types
- Automatic multi-tenancy through proxy interceptor pattern
- Server and client components for different data access patterns

### Authentication & Authorization
- Supabase Auth integration with middleware
- Role-based access control (operators, admins, master users)  
- Store-level data isolation enforced at the database client level
- Session management through cookies and middleware

### Form System
- React Hook Form with Zod validation
- Custom form builder component in `src/components/form-builder/`
- Reusable form components for all CRUD operations
- Input masking for Brazilian documents (CPF, CNPJ, phone numbers)

### UI Framework
- Tailwind CSS for styling
- Radix UI components for accessible primitives
- shadcn/ui component library
- Dark/light theme support with next-themes
- Responsive design with mobile-first approach

## Important Patterns

### Server Actions
Most data operations use Next.js Server Actions, typically found in `actions.ts` files within route directories.

### Type Safety
- All database operations are type-safe using generated Supabase types
- Form validation using Zod schemas
- Strict TypeScript configuration

### State Management
- Server state managed through Supabase
- Client state managed through React hooks
- Form state via React Hook Form
- Theme state via next-themes

### File Organization
- Route-based organization under `src/app/`
- Shared components in `src/components/`
- Utilities and helpers in `src/lib/` and `src/utils/`
- Type definitions in `src/types/`
- Hooks in `src/hooks/`

## Dependencies

### Core Framework
- Next.js 15 with App Router
- React 18
- TypeScript

### Database & Auth
- Supabase (client, SSR, auth)
- Generated TypeScript types

### UI & Styling
- Tailwind CSS with animations
- Radix UI primitives
- shadcn/ui components
- Lucide React icons
- Framer Motion for animations

### Forms & Validation
- React Hook Form
- Zod validation
- Custom input masks for Brazilian formats

### Utilities
- date-fns for date manipulation
- lodash for utility functions
- numeral for number formatting
- xlsx for Excel export functionality

## Package Management
- Uses pnpm as package manager
- Workspace configuration for specific dependencies (sharp, supabase)
- Lockfiles: both pnpm-lock.yaml and legacy yarn.lock/bun.lock present