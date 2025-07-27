@echo off
title Carwash Peña Blanca - Aplicación Ejecutable
color 0A

echo.
echo ========================================
echo    CARWASH PEÑA BLANCA - SISTEMA
echo ========================================
echo.
echo Iniciando aplicación ejecutable...
echo.

cd /d "%~dp0"

REM Verificar si existe el ejecutable
if not exist "CarwashPenaBlanca.exe" (
    echo ERROR: No se encontró CarwashPenaBlanca.exe
    echo.
    echo Verifica que todos los archivos estén en la carpeta:
    echo • CarwashPenaBlanca.exe
    echo • Este archivo INICIAR-CARWASH.bat
    echo.
    pause
    exit /b 1
)

echo ✓ Aplicación ejecutable encontrada
echo ✓ Iniciando Carwash Peña Blanca...
echo.
echo INFORMACIÓN:
echo • Aplicación: CarwashPenaBlanca.exe (independiente)
echo • Contraseña de administrador: 742211010338
echo • Datos se guardan automáticamente
echo • NO requiere navegador ni Node.js
echo.

REM Ejecutar la aplicación
echo Abriendo aplicación...
start "" "CarwashPenaBlanca.exe"

echo.
echo ✅ Aplicación iniciada correctamente!
echo.
echo NOTA: La aplicación se abre en su propia ventana
echo Si no se abre, haz doble clic en CarwashPenaBlanca.exe
echo.
echo Puedes cerrar esta ventana ahora.
timeout /t 5 /nobreak >nul
exit