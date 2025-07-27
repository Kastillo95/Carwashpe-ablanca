@echo off
title Carwash Peña Blanca - Sistema de Gestión
color 0A
cd /d "%~dp0"

echo.
echo ========================================
echo    CARWASH PEÑA BLANCA - SISTEMA
echo ========================================
echo.
echo Iniciando aplicación de gestión...
echo.

REM Verificar que el ejecutable existe
if not exist "CarwashPenaBlanca.exe" (
    echo ERROR: CarwashPenaBlanca.exe no encontrado.
    echo Verifica que el archivo esté en esta carpeta.
    pause
    exit /b 1
)

echo ✓ Archivo ejecutable encontrado
echo ✓ Contraseña admin: 742211010338
echo ✓ Base de datos SQLite integrada
echo.

echo Iniciando Carwash Peña Blanca...
echo.
echo INFORMACIÓN IMPORTANTE:
echo • El sistema se abrirá automáticamente
echo • Usa la contraseña: 742211010338
echo • Para cerrar: Cierra la aplicación normalmente
echo.

REM Ejecutar la aplicación
start "" "CarwashPenaBlanca.exe"

echo ✓ Aplicación iniciada correctamente
echo.
echo Si necesitas ejecutar nuevamente, haz doble clic en CarwashPenaBlanca.exe
echo.
timeout /t 3 /nobreak >nul