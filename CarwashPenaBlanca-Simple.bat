@echo off
title Carwash Peña Blanca - Sistema de Gestión
color 0A
cd /d "%~dp0"

echo.
echo ========================================
echo    CARWASH PEÑA BLANCA - SISTEMA
echo ========================================
echo.
echo Iniciando aplicación de gestión...
echo.

REM Crear directorio de datos
if not exist CarwashData mkdir CarwashData

REM Configurar variables
set NODE_ENV=production
set PORT=3001
set DATABASE_URL=file:CarwashData/carwash.db

REM Verificar archivos
if not exist "dist\index.js" (
    echo ERROR: Archivos de aplicación no encontrados.
    echo Verifica que la carpeta 'dist' exista con los archivos necesarios.
    pause
    exit /b 1
)

echo ✓ Configurando base de datos SQLite local
echo ✓ Puerto configurado: 3001
echo ✓ Datos en: CarwashData\carwash.db
echo.

echo Iniciando servidor backend...
start /B node dist/index.js

echo Esperando que el servidor inicie...
timeout /t 3 /nobreak >nul

echo.
echo ✓ Abriendo aplicación en navegador...
echo.
echo INFORMACIÓN:
echo • URL: http://localhost:3001
echo • Contraseña admin: 742211010338
echo • Para cerrar: Ctrl+C en esta ventana
echo.

REM Abrir navegador en modo app (parece aplicación)
start "" "http://localhost:3001"

echo Aplicación iniciada. Mantén esta ventana abierta.
echo Para acceder nuevamente: http://localhost:3001
echo.
pause