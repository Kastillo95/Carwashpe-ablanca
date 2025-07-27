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

echo ✅ Componentes listos!
echo 🖥️  Iniciando servidor web...
echo ⏳ Se abrirá automáticamente en tu navegador...
echo.
echo 💡 Para cerrar la aplicación: Ctrl+C
echo.

REM Iniciar el servidor simple
node servidor-simple.cjs

REM Si llegamos aquí, la aplicación se cerró
echo.
echo 👋 Aplicación cerrada
echo.
pause