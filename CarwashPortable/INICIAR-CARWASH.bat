@echo off
echo 🚀 Iniciando Carwash Peña Blanca...
echo.
echo ⏳ Espera un momento mientras se carga...
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado en este sistema
    echo.
    echo 💡 Descarga e instala Node.js desde: https://nodejs.org
    echo    (Versión recomendada: LTS)
    echo.
    pause
    exit /b 1
)

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo 📦 Instalando componentes necesarios...
    npm install --production --silent
)

REM Iniciar la aplicación
echo ✅ Abriendo aplicación...
npm start

pause