@echo off
echo.
echo ========================================
echo   INSTALADOR CARWASH PEÑA BLANCA
echo ========================================
echo.

set INSTALL_DIR=%ProgramFiles%\CarwashPenaBlanca
set DESKTOP=%USERPROFILE%\Desktop

echo Instalando en: %INSTALL_DIR%
echo.

REM Crear directorio de instalación
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Copiar archivos
copy "CarwashPenaBlanca.exe" "%INSTALL_DIR%\"
if exist "public" xcopy "public" "%INSTALL_DIR%\public\" /E /I /Y

REM Crear acceso directo en escritorio
echo [InternetShortcut] > "%DESKTOP%\Carwash Peña Blanca.url"
echo URL=file:///%INSTALL_DIR%\CarwashPenaBlanca.exe >> "%DESKTOP%\Carwash Peña Blanca.url"

echo.
echo ✅ Instalación completada!
echo.
echo 🖥️  Acceso directo creado en el escritorio
echo 📁 Instalado en: %INSTALL_DIR%
echo 🔐 Contraseña de admin: 742211010338
echo.
echo Para ejecutar: Doble clic en "Carwash Peña Blanca" en el escritorio
echo.
pause