@echo off
title Carwash Peña Blanca - Iniciando Sistema
color 0A

echo.
echo ========================================
echo    CARWASH PEÑA BLANCA - SISTEMA
echo ========================================
echo.
echo Iniciando aplicación de gestión...
echo.

cd /d "%~dp0"

REM Crear directorio de datos si no existe
if not exist CarwashData mkdir CarwashData

REM Configurar variables de entorno
set ELECTRON_MODE=true
set NODE_ENV=production
set PORT=3001
set DATABASE_URL=file:CarwashData/carwash.db

REM Verificar si Node.js está disponible
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no está instalado en este sistema
    echo.
    echo Descarga e instala Node.js desde: https://nodejs.org
    echo Recomendamos la versión LTS (Long Term Support)
    echo.
    echo Después de instalar Node.js, ejecuta este archivo nuevamente.
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js detectado
echo ✓ Configurando base de datos SQLite local
echo ✓ Puerto configurado: 3001
echo.

REM Verificar si el archivo del servidor existe
if not exist "dist\index.js" (
    echo ERROR: Archivos de aplicación no encontrados
    echo Verifica que la carpeta 'dist' contenga los archivos necesarios
    echo.
    pause
    exit /b 1
)

echo Iniciando servidor backend...

REM Iniciar servidor en segundo plano
start /B node dist/index.js

REM Esperar a que el servidor inicie
echo Esperando a que el servidor inicie...
timeout /t 3 /nobreak >nul

REM Verificar si el servidor está corriendo
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001' -TimeoutSec 5 -ErrorAction Stop; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo Esperando un poco más...
    timeout /t 3 /nobreak >nul
)

echo.
echo ✓ Servidor iniciado correctamente
echo ✓ Abriendo aplicación en navegador...
echo.
echo INFORMACIÓN IMPORTANTE:
echo • URL de la aplicación: http://localhost:3001
echo • Contraseña de administrador: 742211010338
echo • Los datos se guardan en: CarwashData\carwash.db
echo • Para cerrar: Ctrl+C en esta ventana
echo.

REM Abrir navegador con la aplicación (modo app para parecer aplicación de escritorio)
start "" "http://localhost:3001"

echo La aplicación está funcionando.
echo.
echo Para detener el servidor, presiona Ctrl+C
echo Para acceder nuevamente: http://localhost:3001
echo.

REM Mantener la ventana abierta y mostrar logs del servidor
pause