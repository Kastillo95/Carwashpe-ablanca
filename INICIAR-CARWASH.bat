@echo off
echo Iniciando Carwash Peña Blanca...
echo.
cd /d "%~dp0"
if not exist node_modules (
    echo Instalando dependencias por primera vez...
    npm install --production
)
echo Abriendo aplicación...
set ELECTRON_MODE=true
set NODE_ENV=production
set PORT=3001
start "" "%~dp0node_modules\.bin\electron" electron-main.js
echo.
echo La aplicación se está iniciando...
echo Si no abre automáticamente, espera unos segundos.
pause