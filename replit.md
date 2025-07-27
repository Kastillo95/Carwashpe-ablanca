# Carwash Management System - Replit Migration

## Project Overview
This is a comprehensive carwash management system with inventory, appointment booking, invoicing, and CRM features. The project includes both a web application and electron-based portable app.

**Current State:** Migrating from Replit Agent to standard Replit environment
**Technology Stack:** 
- Frontend: React + Vite with TypeScript
- Backend: Express.js + Node.js
- Database: PostgreSQL with Drizzle ORM
- UI: Tailwind CSS + Shadcn/UI components

## User Preferences
- Business focused on car wash operations
- Needs both web and portable app versions
- Security is important (admin password protection)
- Spanish language interface

## Project Architecture
- **Frontend:** React SPA with Wouter routing in `client/src/`
- **Backend:** Express API server in `server/`
- **Shared:** Common schemas and types in `shared/`
- **Database:** PostgreSQL with Drizzle migrations
- **Storage:** Dual implementation (Memory + Database) for flexibility

## Recent Changes
- [In Progress] Migrating from Agent to Replit environment
- [In Progress] Fixing TypeScript errors in storage implementation
- [In Progress] Configuring database connectivity

## Next Steps
1. Fix storage implementation type errors
2. Ensure application runs cleanly
3. Test all features work properly
4. Complete migration checklist