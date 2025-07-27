@echo off
echo 🚀 Iniciando Carwash Peña Blanca...
echo.

REM Cambiar al directorio del script
cd /d "%~dp0"

REM Verificar si Node.js está instalado
echo 🔍 Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado en este sistema
    echo.
    echo 💡 Descarga e instala Node.js desde: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado!
echo.

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo 📦 Instalando componentes necesarios...
    echo    (Esto puede tardar unos minutos la primera vez)
    npm install --production
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        echo.
        pause
        exit /b 1
    )
)

REM Mostrar mensaje antes de iniciar
echo ✅ Componentes listos!
echo 🖥️  Iniciando aplicación...
echo ⏳ Espera unos segundos, se abrirá automáticamente...
echo.

REM Iniciar la aplicación
node electron-main.js

REM Si llegamos aquí, hubo un error
echo.
echo ❌ La aplicación se cerró inesperadamente
echo 💡 Revisa los mensajes de error arriba
echo.
pause