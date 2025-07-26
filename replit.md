# Carwash Peña Blanca Management System

## Overview

This is a comprehensive car wash management system built with React (frontend) and Express.js (backend). The application provides appointment scheduling, inventory management, billing, and reporting capabilities for a car wash business. It features a dual-mode interface (user/admin) with password-protected administrative functions.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### July 26, 2025 - Sistema CRM Completo con WhatsApp y Gestión Automática de Clientes
- **Sistema CRM Completo**: Implementado módulo CRM con gestión automática de clientes desde facturación
- **Gestión Automática**: Los clientes se guardan automáticamente al crear facturas, actualizando datos existentes
- **WhatsApp Integration**: Sistema de envío de promociones masivas y mensajes individuales vía WhatsApp
- **Gestión de Promociones**: Creación, gestión y envío de promociones con fechas de validez y descuentos
- **Búsqueda Avanzada**: Sistema de búsqueda de clientes por nombre, teléfono o email
- **Analíticas CRM**: Mejores clientes, estadísticas de gastos y análisis de comportamiento
- **Base de Datos Expandida**: Nuevas tablas para customers, promotions y promotion_sends
- **Migración Completa**: Sistema migrado exitosamente de Replit Agent a ambiente estándar de Replit
- **Configuración PostgreSQL**: Actualizada configuración de base de datos de Neon a PostgreSQL local de Replit
- **Optimización de Impresión Térmica**: Sistema completo de impresión con formato térmico mejorado, incluyendo logo
- **Corrección de Errores TypeScript**: Solucionados problemas de tipos en cálculos de facturas
- **Sistema de Impresión Unificado**: Todas las funciones de impresión usan formato térmico optimizado con logo incluido
- **Esquema de Base de Datos**: Migración exitosa de esquemas con Drizzle ORM
- **Actualización de Horarios**: Horarios actualizados - Lunes a Sábado: 8am-5pm, Domingos: 8am-3pm
- **Impresión con Logo**: Recibos térmicos incluyen logo empresarial con estilos optimizados para impresión

### July 21, 2025 - Sistema de Facturación Mejorado con Vista Previa SAP
- **Sistema de Facturación SAP**: Implementado interfaz estilo SAP con vista previa en tiempo real lado a lado
- **Acceso Universal a Productos**: Usuarios normales ahora pueden acceder a todos los servicios y productos
- **Vista Previa Automática**: Actualización en tiempo real de la vista previa mientras se llena el formulario
- **Base de Datos Expandida**: Agregados productos de muestra (champú, cera, limpiador, aromatizante, aspirado)
- **Selección Manual Mejorada**: Corregido sistema de selección manual en facturación rápida
- **Servicios Predefinidos**: Integrados servicios de CONSTANTS disponibles para todos los usuarios
- **Vista de Facturas para Usuarios**: Usuarios normales pueden ver la lista completa de facturas (solo lectura)
- **Opciones de Impresión Mejoradas**: Diálogo de impresión después de crear facturas en ambos modos
- **Acceso Completo a Facturación**: Usuarios normales tienen acceso completo al módulo de facturación
- **Corrección de IDs**: Solucionado problema de IDs decimales que causaba errores en la base de datos
- **Interfaz Dual**: Modo admin ve lista completa de facturas, usuarios normales solo crean facturas nuevas
- **Sistema Excel para Inventario**: Implementado exportación e importación de inventario en formato Excel
- **Logo en Facturas**: Integrado logo oficial del carwash en recibos térmicos
- **Acceso Inventario Universal**: Usuarios normales pueden ver inventario (solo lectura) y exportar Excel

### July 12, 2025 - Migración y Sistema Térmico Original
- **Migración Completa a Replit**: Sistema migrado exitosamente de Replit Agent a ambiente estándar de Replit
- **Sistema de Facturación Térmica**: Implementado diseño profesional de recibos térmicos con logo empresarial
- **Vista Previa de Facturas**: Usuarios normales pueden crear facturas con vista previa e impresión
- **Corrección de Errores NaN**: Solucionados problemas de cálculos en totales de facturas
- **Datos de Muestra**: Base de datos poblada con servicios y productos de ejemplo
- **Permisos de Usuario**: Empleados pueden crear facturas sin restricciones de administrador
- **Impresión Optimizada**: Sistema de impresión térmica con formato profesional de 80mm
- **Corrección Stock Validation**: Servicios ya no requieren validación de inventario
- **API Invoice Fix**: Corregido problema de respuesta vacía en vista previa de facturas
- **React Error Fix**: Solucionado error de renderizado de objeto BUSINESS_INFO.hours
- **Print Enhancement**: Mejorado sistema de impresión para usuarios normales con mejor manejo de errores
- **Tax Information Hidden**: Eliminada información de impuestos de facturas para evitar apariencia de cobro fiscal
- **Simplified Invoice Display**: Facturas ahora muestran solo total sin desglose de impuestos

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