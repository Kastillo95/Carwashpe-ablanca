@echo off
title Carwash Peña Blanca - Versión Web Portable
color 0E
cd /d "%~dp0"

echo.
echo ==========================================
echo    CARWASH PEÑA BLANCA - VERSIÓN WEB
echo ==========================================
echo.
echo Esta versión funciona en CUALQUIER PC
echo No necesita instalaciones especiales
echo.

REM Verificar Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado en este PC
    echo.
    echo SOLUCIONES:
    echo 1. Instala Node.js desde: nodejs.org
    echo 2. O usa la versión Java del sistema
    echo 3. O contacta para versión con Node.js incluido
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js detectado
echo ✓ Iniciando versión web...
echo.

REM Configurar variables
set NODE_ENV=development
set PORT=3001

echo Iniciando servidor...
echo.
echo INFORMACIÓN:
echo • URL: http://localhost:3001
echo • Contraseña: 742211010338
echo • Para cerrar: Ctrl+C en esta ventana
echo.

REM Iniciar servidor (simulado - necesitaríamos los archivos)
echo [SIMULACIÓN] Servidor iniciado en puerto 3001
echo [SIMULACIÓN] Abre tu navegador en: http://localhost:3001
echo.
echo NOTA: Esta es una demostración del concepto
echo Para la versión real, necesitamos preparar los archivos
echo.
pause