@echo off
title 🔧 Sistema Peña Blanca - Diagnóstico y Solución
color 0E
cls

echo.
echo     ╔══════════════════════════════════════════════════════╗
echo     ║        🚗 SISTEMA DE LAVADO PEÑA BLANCA 🚗          ║
echo     ║              DIAGNÓSTICO Y SOLUCIÓN                 ║
echo     ╚══════════════════════════════════════════════════════╝
echo.

REM Cambiar al directorio del script
cd /d "%~dp0"

echo  🔍 PASO 1: Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo  ❌ ERROR: Node.js no está instalado
    echo.
    echo  📥 SOLUCIÓN:
    echo     1. Ir a: https://nodejs.org
    echo     2. Descargar versión LTS
    echo     3. Instalar y reiniciar PC
    echo     4. Ejecutar este archivo nuevamente
    echo.
    pause
    exit /b 1
) else (
    echo  ✅ Node.js detectado correctamente
)

echo.
echo  🔍 PASO 2: Verificando archivos del proyecto...
if not exist "package.json" (
    echo  ❌ ERROR: Archivos del proyecto no encontrados
    echo     Asegúrate de estar en la carpeta correcta del proyecto
    pause
    exit /b 1
) else (
    echo  ✅ Archivos del proyecto encontrados
)

echo.
echo  🔍 PASO 3: Cerrando procesos anteriores...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
echo  ✅ Procesos anteriores cerrados

echo.
echo  📦 PASO 4: Instalando/actualizando dependencias...
echo     (Esto puede tomar unos minutos...)
npm install --silent
if errorlevel 1 (
    echo  ❌ ERROR en instalación de dependencias
    echo  🔄 Intentando limpiar cache...
    npm cache clean --force
    rmdir /s /q node_modules >nul 2>&1
    npm install
    if errorlevel 1 (
        echo  ❌ Error persistente en dependencias
        pause
        exit /b 1
    )
)
echo  ✅ Dependencias instaladas correctamente

echo.
echo  🚀 PASO 5: Iniciando servidor...
echo     El navegador se abrirá automáticamente
echo     Si no se abre, ir manualmente a: http://localhost:5000
echo.

REM Esperar 3 segundos y abrir navegador
timeout /t 3 /nobreak >nul
start http://localhost:5000

REM Iniciar servidor
echo  🌐 Sistema iniciando...
npm run dev

echo.
echo  🔴 El sistema se ha cerrado
pause