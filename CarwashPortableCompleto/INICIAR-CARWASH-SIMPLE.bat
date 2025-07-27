@echo off
title Carwash Peña Blanca - Sistema Completo
color 0B
cd /d "%~dp0"

echo.
echo ==========================================
echo    CARWASH PEÑA BLANCA - SISTEMA
echo ==========================================
echo.

echo Verificando sistema...

REM Verificar Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Este PC necesita Node.js instalado
    echo.
    echo SOLUCIONES FÁCILES:
    echo.
    echo 1. INSTALAR NODE.JS (Recomendado):
    echo    • Ve a: https://nodejs.org
    echo    • Descarga la versión LTS
    echo    • Instala y reinicia la PC
    echo.
    echo 2. USAR LA VERSIÓN WEB:
    echo    • Funciona sin instalaciones
    echo    • Abre tu navegador
    echo    • Usa la URL del proyecto
    echo.
    echo 3. VERSIÓN JAVA (Alternativa):
    echo    • Contacta para la versión Java
    echo    • No necesita Node.js
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js encontrado
echo ✓ Iniciando sistema...
echo.

REM Configurar ambiente
set NODE_ENV=production
set PORT=3001

echo Configuración:
echo • Puerto: 3001
echo • Contraseña: 742211010338
echo • Base de datos: SQLite local
echo.

echo Iniciando servidor...

REM Verificar si existe el archivo principal
if exist "index.js" (
    echo ✓ Archivos del sistema encontrados
    echo.
    echo Iniciando Carwash Peña Blanca...
    echo Abriendo en navegador...
    echo.
    
    REM Iniciar servidor en segundo plano
    start /B node index.js
    
    REM Esperar un momento
    timeout /t 3 /nobreak >nul
    
    REM Abrir navegador
    start "" "http://localhost:3001"
    
    echo.
    echo ✅ SISTEMA INICIADO CORRECTAMENTE
    echo.
    echo • URL: http://localhost:3001
    echo • Contraseña: 742211010338
    echo • Para cerrar: Cierra esta ventana
    echo.
    echo Mantén esta ventana abierta mientras usas el sistema.
    echo.
    pause
) else (
    echo ❌ Archivos del sistema no encontrados
    echo.
    echo SOLUCIÓN:
    echo • Verifica que todos los archivos estén presentes
    echo • O usa la versión web directamente
    echo.
    pause
)