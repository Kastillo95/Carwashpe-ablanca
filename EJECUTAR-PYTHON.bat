@echo off
title Sistema de Lavado Peña Blanca - Python
echo.
echo ========================================
echo   SISTEMA DE LAVADO PEÑA BLANCA
echo   Version Python con FastAPI
echo ========================================
echo.
echo Iniciando servidor Python...
echo.

cd /d "%~dp0"
python run_python.py

echo.
echo Sistema finalizado.
pause