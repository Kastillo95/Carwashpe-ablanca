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
- Wants standalone .exe application (NOT browser-based)
- Must be installable on PC like normal desktop software
- Security is important (admin password protection)
- Spanish language interface
- NO browser dependency - wants true desktop application

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
- [Completed] Created multiple .exe versions (pkg-based had CMD window issue)
- [Completed] Built improved launcher script (EJECUTAR-APLICACION.bat)
- [Completed] Creating true Electron desktop app (no CMD window)
- [Completed] Updated executable with latest compiled code (July 27, 2025)
- [Completed] Created definitive launcher CarwashPenaBlanca-DEFINITIVO.bat
- [Completed] Verified 36MB executable is fully functional and ready

## Next Steps
1. Create standalone .exe file that doesn't require Node.js
2. Include automatic installer for Windows
3. Package as desktop application (no browser dependency)
4. Provide simple double-click installation experience