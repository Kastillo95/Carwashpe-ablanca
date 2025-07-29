@echo off
title 🔄 Sistema Peña Blanca - Backup y Migración
color 0E
cls

echo.
echo     ╔══════════════════════════════════════════════════════╗
echo     ║        🚗 SISTEMA DE LAVADO PEÑA BLANCA 🚗          ║
echo     ║              BACKUP Y MIGRACIÓN DE DATOS             ║
echo     ╚══════════════════════════════════════════════════════╝
echo.

:MENU
echo  🔄 OPCIONES DISPONIBLES:
echo.
echo     1. 💾 Crear Backup de Datos
echo     2. 📥 Restaurar Backup
echo     3. 🖥️  Preparar para Nueva PC
echo     4. 🔍 Verificar Estado de Base de Datos
echo     5. 🚪 Salir
echo.
set /p opcion="  Selecciona una opción (1-5): "

if "%opcion%"=="1" goto BACKUP
if "%opcion%"=="2" goto RESTAURAR
if "%opcion%"=="3" goto NUEVA_PC
if "%opcion%"=="4" goto VERIFICAR
if "%opcion%"=="5" goto SALIR
goto MENU

:BACKUP
cls
echo  💾 CREANDO BACKUP DE DATOS...
echo.
if not exist "carwash-local.db" (
    echo  ❌ No se encontró la base de datos
    echo     Ejecuta primero la aplicación para crear datos
    pause
    goto MENU
)

set fecha=%date:~6,4%-%date:~3,2%-%date:~0,2%
set hora=%time:~0,2%-%time:~3,2%
set nombre_backup=backup-carwash-%fecha%-%hora%.db

echo  📁 Creando backup: %nombre_backup%
copy "carwash-local.db" "backups\%nombre_backup%" >nul 2>&1
if not exist "backups" mkdir "backups"
copy "carwash-local.db" "backups\%nombre_backup%"

echo  ✅ Backup creado exitosamente
echo     Ubicación: backups\%nombre_backup%
echo.
pause
goto MENU

:RESTAURAR
cls
echo  📥 RESTAURAR BACKUP...
echo.
if not exist "backups" (
    echo  ❌ No hay backups disponibles
    pause
    goto MENU
)

echo  📂 Backups disponibles:
dir /b "backups\*.db"
echo.
set /p archivo_backup="  Nombre del archivo de backup: "

if exist "backups\%archivo_backup%" (
    copy "backups\%archivo_backup%" "carwash-local.db"
    echo  ✅ Backup restaurado exitosamente
) else (
    echo  ❌ Archivo de backup no encontrado
)
echo.
pause
goto MENU

:NUEVA_PC
cls
echo  🖥️  PREPARANDO PARA NUEVA PC...
echo.
echo  📦 Creando paquete completo para instalación...

if exist "PaqueteNuevaPC" rmdir /s /q "PaqueteNuevaPC"
mkdir "PaqueteNuevaPC"

echo  📁 Copiando archivos esenciales...
xcopy /E /I /Q "client" "PaqueteNuevaPC\client" >nul
xcopy /E /I /Q "server" "PaqueteNuevaPC\server" >nul
xcopy /E /I /Q "shared" "PaqueteNuevaPC\shared" >nul
copy "package.json" "PaqueteNuevaPC\" >nul
copy "package-lock.json" "PaqueteNuevaPC\" >nul
copy "tsconfig.json" "PaqueteNuevaPC\" >nul
copy "vite.config.ts" "PaqueteNuevaPC\" >nul
copy "tailwind.config.ts" "PaqueteNuevaPC\" >nul
copy "postcss.config.js" "PaqueteNuevaPC\" >nul
copy "components.json" "PaqueteNuevaPC\" >nul
copy "APLICACION-INDEPENDIENTE.bat" "PaqueteNuevaPC\" >nul

REM Incluir base de datos si existe
if exist "carwash-local.db" (
    copy "carwash-local.db" "PaqueteNuevaPC\"
    echo  💾 Base de datos incluida
) else (
    echo  ℹ️  Se creará nueva base de datos al iniciar
)

REM Crear instrucciones para nueva PC
echo # INSTRUCCIONES PARA NUEVA PC > "PaqueteNuevaPC\INSTALAR-EN-NUEVA-PC.md"
echo. >> "PaqueteNuevaPC\INSTALAR-EN-NUEVA-PC.md"
echo 1. Copiar toda esta carpeta a la nueva PC >> "PaqueteNuevaPC\INSTALAR-EN-NUEVA-PC.md"
echo 2. Instalar Node.js desde: https://nodejs.org >> "PaqueteNuevaPC\INSTALAR-EN-NUEVA-PC.md"
echo 3. Doble clic en: APLICACION-INDEPENDIENTE.bat >> "PaqueteNuevaPC\INSTALAR-EN-NUEVA-PC.md"
echo 4. ¡Sistema funcionando en nueva PC! >> "PaqueteNuevaPC\INSTALAR-EN-NUEVA-PC.md"

echo  ✅ Paquete para nueva PC creado
echo     Ubicación: PaqueteNuevaPC\
echo     Instrucciones: INSTALAR-EN-NUEVA-PC.md
echo.
pause
goto MENU

:VERIFICAR
cls
echo  🔍 VERIFICANDO ESTADO DE BASE DE DATOS...
echo.
if exist "carwash-local.db" (
    echo  ✅ Base de datos encontrada: carwash-local.db
    for %%I in ("carwash-local.db") do echo     Tamaño: %%~zI bytes
    for %%I in ("carwash-local.db") do echo     Modificado: %%~tI
) else (
    echo  ❌ Base de datos no encontrada
    echo     Se creará automáticamente al iniciar la aplicación
)

echo.
if exist "backups" (
    echo  📂 Backups disponibles:
    dir /b "backups\*.db"
) else (
    echo  📂 No hay backups creados aún
)

echo.
pause
goto MENU

:SALIR
echo.
echo  👋 ¡Gracias por usar el Sistema de Lavado Peña Blanca!
timeout /t 2 /nobreak >nul
exit