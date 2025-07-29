@echo off
title Sistema de Lavado de Autos - Peña Blanca
echo ================================
echo   SISTEMA DE LAVADO DE AUTOS
echo        PEÑA BLANCA
echo ================================
echo.
echo Iniciando aplicacion...
echo Por favor espere...
echo.

REM Cambiar al directorio del proyecto
cd /d "%~dp0"

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instale Node.js desde https://nodejs.org
    pause
    exit /b 1
)

REM Instalar dependencias si es necesario
if not exist "node_modules" (
    echo Instalando dependencias por primera vez...
    npm install
)

REM Iniciar la aplicación
echo Abriendo Sistema de Lavado...
start "" "http://localhost:5000"
npm run dev

REM Si llega aquí, la aplicación se cerró
echo.
echo La aplicacion se ha cerrado.
pause