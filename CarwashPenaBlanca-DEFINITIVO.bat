@echo off
title Carwash Peña Blanca - Sistema Definitivo
color 0A
cd /d "%~dp0"

echo.
echo ==========================================
echo   CARWASH PEÑA BLANCA - VERSION DEFINITIVA
echo ==========================================
echo.
echo ✓ Iniciando aplicación de gestión...
echo ✓ Version actualizada con todas las mejoras
echo.

REM Ir a la carpeta portable
cd CarwashPortable

REM Crear directorio de datos si no existe
if not exist CarwashData mkdir CarwashData

REM Configurar variables
set NODE_ENV=production
set PORT=3001
set DATABASE_URL=file:CarwashData/carwash.db

echo ✓ Base de datos configurada: SQLite local
echo ✓ Puerto del servidor: 3001
echo ✓ Datos guardados en: CarwashData\carwash.db
echo.

echo Iniciando sistema...
echo.

REM Verificar si existe el ejecutable
if exist "CarwashPenaBlanca.exe" (
    echo ✓ Usando ejecutable optimizado
    start "" "CarwashPenaBlanca.exe"
) else (
    echo ✓ Usando modo servidor
    if exist "index.js" (
        start /B node index.js
        timeout /t 3 /nobreak >nul
        start "" "http://localhost:3001"
    ) else (
        echo ERROR: Archivos de aplicación no encontrados
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   APLICACIÓN INICIADA CORRECTAMENTE
echo ========================================
echo.
echo URL: http://localhost:3001
echo Contraseña admin: 742211010338
echo.
echo CARACTERÍSTICAS:
echo • Sistema completo de gestión de lavado
echo • Inventario y control de productos
echo • Citas y programación
echo • Facturación integrada
echo • CRM de clientes
echo • Base de datos local SQLite
echo • Funciona sin internet
echo.
echo Para cerrar: Cierra esta ventana
echo.
pause