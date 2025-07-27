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
- [Completed] Migrated from Agent to Replit environment
- [Completed] Fixed TypeScript errors in storage implementation
- [Completed] Configured SQLite database for portable application
- [Completed] Created portable executable application
- [Completed] Application runs independently without browser requirements

## Next Steps
1. User can copy CarwashPortable folder to any Windows PC
2. Execute INICIAR-CARWASH.bat to run the application
3. Application opens in its own window (no browser needed)
4. All data saved locally in SQLite database