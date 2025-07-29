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
- Wants standalone application that works like desktop software
- Must be installable on PC like normal desktop software
- Security is important (admin password protection)
- Spanish language interface
- NO browser dependency - wants true desktop application
- COMPLETELY INDEPENDENT - no dependency on Replit or external servers
- Must work offline and maintain all data locally
- Automatic startup without manual server management
- MULTI-PC INSTALLATION - wants to install on multiple computers
- Portable and easily transferable between machines
- Complete data backup and migration capabilities
- NO CMD WINDOW - wants program to open directly without showing command prompt
- Wants desktop shortcut that works like normal Windows program
- Professional appearance without technical windows visible

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
- [Completed] Added PostgreSQL database with complete schema migration
- [Completed] Updated all storage implementations to use PostgreSQL with Drizzle ORM
- [Completed] Database relations and constraints properly configured
- [Completed] Created automatic launcher scripts for desktop-like experience (July 29, 2025)
- [Completed] Implemented automatic system initialization with pre-loaded data
- [Completed] Configured persistent data storage - no data loss on restart
- [Completed] Added professional dashboard with real-time information
- [Completed] System now functions as requested: no CMD dependency, automatic startup, persistent records
- [Completed] Converted to completely independent offline application (no Replit dependency)
- [Completed] Created SQLite local database system with automatic table creation
- [Completed] Built desktop-ready launcher scripts for complete independence
- [Completed] System now works completely offline with permanent data storage
- [Completed] Created installation packages and guides for user desktop deployment
- [Completed] Created automatic launcher scripts for desktop-like experience (July 29, 2025)
- [Completed] Implemented automatic system initialization with pre-loaded data
- [Completed] Configured persistent data storage - no data loss on restart
- [Completed] Added professional dashboard with real-time information
- [Completed] System now functions as requested: no CMD dependency, automatic startup, persistent records

## Next Steps
1. Create standalone .exe file that doesn't require Node.js
2. Include automatic installer for Windows
3. Package as desktop application (no browser dependency)
4. Provide simple double-click installation experience

## Java Version Development
- [In Progress] Converting entire system to Java with JavaFX desktop interface
- [Completed] Created Maven project structure with Spring Boot + JavaFX
- [Completed] Implemented JPA entities for all database models
- [Completed] Created repository layer with Spring Data JPA
- [Completed] Built service layer for business logic
- [Completed] Designed JavaFX UI with modern CSS styling
- [In Progress] Implementing remaining controllers and views