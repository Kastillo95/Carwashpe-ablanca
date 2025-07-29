@echo off
chcp 1252 >nul
title Sistema de Lavado Peña Blanca - Iniciando...
color 0A

echo.
echo     ╔══════════════════════════════════════╗
echo     ║    SISTEMA DE LAVADO PEÑA BLANCA     ║
echo     ║           VERSION DEFINITIVA         ║
echo     ╚══════════════════════════════════════╝
echo.
echo  🚗 Iniciando sistema...
timeout /t 2 /nobreak >nul

cd /d "%~dp0"

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  ❌ ERROR: Node.js no encontrado
    echo     Descargue desde: https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Verificar dependencias
if not exist "node_modules" (
    echo  📦 Instalando componentes del sistema...
    npm install --silent
    if errorlevel 1 (
        color 0C
        echo  ❌ Error en instalacion
        pause
        exit /b 1
    )
)

echo  🌐 Preparando base de datos...
npm run db:push >nul 2>&1

echo  🚀 Abriendo aplicacion web...
timeout /t 1 /nobreak >nul

REM Abrir navegador después de 3 segundos
start /min cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5000"

REM Iniciar servidor
title Sistema de Lavado Peña Blanca - ACTIVO
echo  ✅ Sistema ACTIVO en http://localhost:5000
echo  📊 Manteniendo registro de datos...
echo.
echo     Para cerrar: Ctrl+C o cerrar esta ventana
echo     ==========================================
npm run dev