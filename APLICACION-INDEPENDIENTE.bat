@echo off
chcp 65001 >nul 2>&1
title 🚗 SISTEMA DE LAVADO PEÑA BLANCA - INDEPENDIENTE
color 0A
cls

echo.
echo     ╔══════════════════════════════════════════════════════╗
echo     ║        🚗 SISTEMA DE LAVADO PEÑA BLANCA 🚗          ║
echo     ║               VERSIÓN INDEPENDIENTE                  ║
echo     ║          (NO REQUIERE INTERNET NI REPLIT)            ║
echo     ╚══════════════════════════════════════════════════════╝
echo.
echo  ✅ CARACTERÍSTICAS:
echo     • Funciona sin internet
echo     • Base de datos local SQLite
echo     • Todos los datos se guardan permanentemente
echo     • No depende de Replit ni servidores externos
echo     • Bitácora completa de actividades
echo.
echo  🚀 Iniciando aplicación...
timeout /t 2 /nobreak >nul

cd /d "%~dp0"

REM Verificar Node.js
echo  🔍 Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo.
    echo  ❌ ERROR: Node.js no está instalado
    echo.
    echo  📥 SOLUCIÓN:
    echo     1. Descargar Node.js desde: https://nodejs.org
    echo     2. Instalar versión LTS (recomendada)
    echo     3. Reiniciar esta aplicación
    echo.
    pause
    exit /b 1
)

REM Verificar/instalar dependencias
if not exist "node_modules" (
    echo  📦 Primera instalación - configurando componentes...
    echo     (Esto solo sucede la primera vez)
    npm install --silent
    if errorlevel 1 (
        color 0C
        echo  ❌ Error en instalación de componentes
        pause
        exit /b 1
    )
)

echo  💾 Preparando base de datos local...
echo  🔧 Inicializando sistema...

REM Abrir navegador después de 3 segundos (en segundo plano)
start /min cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5000"

REM Cambiar título cuando esté activo
title 🚗 SISTEMA PEÑA BLANCA - ACTIVO ✅

echo.
echo  ✅ SISTEMA ACTIVO EN: http://localhost:5000
echo.
echo     ╔════════════════════════════════════════╗
echo     ║          APLICACIÓN FUNCIONANDO        ║
echo     ║                                        ║
echo     ║  📊 Base de datos: SQLite local        ║
echo     ║  💾 Datos: Guardado automático         ║
echo     ║  🌐 Web: http://localhost:5000         ║
echo     ║  📋 Estado: INDEPENDIENTE ✅           ║
echo     ║                                        ║
echo     ║  Para cerrar: Ctrl+C o cerrar ventana  ║
echo     ╚════════════════════════════════════════╝
echo.

REM Iniciar servidor Node.js
npm run dev