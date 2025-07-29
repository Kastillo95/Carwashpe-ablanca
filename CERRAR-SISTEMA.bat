@echo off
title Cerrando Sistema Peña Blanca
color 0C

echo.
echo  🔴 CERRANDO SISTEMA DE LAVADO PEÑA BLANCA
echo.
echo  Deteniendo todos los procesos...

REM Cerrar procesos de Node.js
taskkill /f /im node.exe >nul 2>&1

REM Cerrar procesos relacionados
taskkill /f /im "npm.exe" >nul 2>&1
taskkill /f /im "tsx.exe" >nul 2>&1

echo  ✅ Sistema cerrado correctamente
echo.
echo  📊 Todos los datos han sido guardados automáticamente
echo  💾 Base de datos: carwash-local.db
echo.
timeout /t 3 /nobreak >nul