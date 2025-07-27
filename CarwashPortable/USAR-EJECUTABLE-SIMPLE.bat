@echo off
title Carwash Peña Blanca - Inicio Rápido
color 0B
cd /d "%~dp0"

echo.
echo ==========================================
echo       CARWASH PEÑA BLANCA - INICIO
echo ==========================================
echo.

REM Verificar ejecutable
if exist "CarwashPenaBlanca.exe" (
    echo ✓ Ejecutable encontrado - Iniciando...
    echo.
    echo CONTRASEÑA ADMIN: 742211010338
    echo.
    start "" "CarwashPenaBlanca.exe"
    echo Sistema iniciado correctamente.
    timeout /t 2 /nobreak >nul
) else (
    echo ❌ ERROR: CarwashPenaBlanca.exe no encontrado
    echo.
    echo SOLUCIÓN:
    echo 1. Verifica que el archivo esté en esta carpeta
    echo 2. Descarga nuevamente si es necesario
    echo.
    pause
)