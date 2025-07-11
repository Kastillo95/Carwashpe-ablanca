# Carwash Peña Blanca Management System

## Overview

This is a comprehensive car wash management system built with React (frontend) and Express.js (backend). The application provides appointment scheduling, inventory management, billing, and reporting capabilities for a car wash business. It features a dual-mode interface (user/admin) with password-protected administrative functions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Simple password-based admin mode
- **API**: RESTful endpoints for all business operations
- **Session Management**: Express sessions with PostgreSQL storage

## Key Components

### Business Logic
- **Appointment Management**: Schedule and track car wash appointments
- **Inventory Management**: Track products, quantities, and suppliers
- **Billing System**: Create and manage invoices with tax calculations
- **Reporting**: Generate business reports and export data
- **Dashboard**: Real-time statistics and overview

### Data Models
- **Services**: Car wash service types with pricing
- **Customers**: Customer information and contact details
- **Appointments**: Scheduled services with status tracking
- **Inventory**: Product catalog with stock management
- **Invoices**: Billing records with line items

### User Interface
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dual Mode**: User mode (limited access) and Admin mode (full access)
- **Form Validation**: Zod schema validation with react-hook-form
- **Real-time Updates**: Automatic data refreshing with React Query

## Data Flow

1. **User Interaction**: Users interact with React components
2. **API Calls**: TanStack Query handles API requests to Express server
3. **Business Logic**: Express routes process requests and validate data
4. **Data Persistence**: Drizzle ORM manages PostgreSQL operations
5. **Response**: JSON responses sent back to frontend
6. **UI Updates**: React Query updates components automatically

## External Dependencies

### Frontend Dependencies
- **UI Framework**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Storage**: connect-pg-simple for PostgreSQL session store
- **Build Tools**: esbuild for server bundling, tsx for development

### Development Tools
- **TypeScript**: Full type safety across the stack
- **ESLint/Prettier**: Code quality and formatting
- **Vite**: Fast development server and build tool

## Deployment Strategy

### Development
- **Server**: tsx runs TypeScript server directly
- **Client**: Vite dev server with HMR
- **Database**: Drizzle migrations for schema management

### Production
- **Build Process**: 
  - Frontend: Vite builds static assets
  - Backend: esbuild bundles Node.js server
- **Database**: PostgreSQL with connection pooling
- **Static Assets**: Served directly by Express in production

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **NODE_ENV**: Environment mode (development/production)
- **Session Security**: Secure session configuration for production

### Business Configuration
- **Services**: Predefined car wash services with pricing
- **Business Info**: Contact details and hours
- **Admin Access**: Password-protected administrative functions
- **Tax Calculation**: Configurable tax rates for invoicing

The system is designed to be easily deployable on cloud platforms with PostgreSQL support, with clear separation between development and production configurations.