@echo off
title 🌐 Sistema Peña Blanca - Servidor Simple
color 0A
cls

echo.
echo     ╔══════════════════════════════════════════════════════╗
echo     ║        🚗 SISTEMA DE LAVADO PEÑA BLANCA 🚗          ║
echo     ║               SERVIDOR ALTERNATIVO                   ║
echo     ╚══════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo  🔧 Usando servidor simple alternativo...
echo  📝 Este método funciona cuando el servidor principal falla
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo  ❌ Node.js requerido - Instalar desde: https://nodejs.org
    pause
    exit
)

echo  ✅ Node.js detectado
echo  🚀 Iniciando servidor alternativo...
echo.

REM Cerrar procesos anteriores
taskkill /f /im node.exe >nul 2>&1

REM Esperar y abrir navegador
timeout /t 2 /nobreak >nul
start http://localhost:5000

REM Iniciar servidor simple
node servidor-simple.js

echo.
echo  🔴 Servidor cerrado
pause