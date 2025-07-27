@echo off
echo.
echo ========================================
echo    CARWASH PEÑA BLANCA - SISTEMA
echo ========================================
echo.
echo Iniciando aplicación...
echo.

cd /d "%~dp0"

REM Configurar variables de entorno
set ELECTRON_MODE=true
set NODE_ENV=production
set PORT=3001
set DATABASE_URL=file:CarwashData/carwash.db

REM Crear directorio de datos si no existe
if not exist CarwashData mkdir CarwashData

REM Verificar si Node.js está disponible
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Node.js no está instalado en este sistema
    echo.
    echo Por favor instala Node.js desde: https://nodejs.org
    echo Luego ejecuta este archivo nuevamente.
    echo.
    pause
    exit /b 1
)

REM Instalar dependencias si es la primera vez
if not exist node_modules (
    echo Instalando dependencias (solo la primera vez)...
    echo Esto puede tomar unos minutos...
    echo.
    npm install --production --silent
    if errorlevel 1 (
        echo.
        echo ERROR: No se pudieron instalar las dependencias
        echo.
        pause
        exit /b 1
    )
)

echo Abriendo aplicación Carwash...
echo.
echo IMPORTANTE:
echo - La aplicación se abrirá en una ventana propia
echo - NO necesitas usar navegador
echo - Contraseña de administrador: 742211010338
echo - Los datos se guardan automáticamente
echo.

REM Iniciar la aplicación
start "" node dist/index.js

echo.
echo Aplicación iniciada correctamente!
echo Puedes cerrar esta ventana.
echo.
timeout /t 3 /nobreak >nul
exit