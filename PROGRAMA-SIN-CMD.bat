@echo off
title Sistema Peña Blanca - Iniciando
echo Preparando aplicacion sin ventana CMD...
echo.
echo Se abrira automaticamente en unos segundos...
timeout /t 2 /nobreak >nul

REM Ejecutar el script VBScript que oculta la ventana CMD
start /min wscript.exe "CarwashPenaBlanca.vbs"

REM Cerrar esta ventana después de iniciar
timeout /t 1 /nobreak >nul
exit