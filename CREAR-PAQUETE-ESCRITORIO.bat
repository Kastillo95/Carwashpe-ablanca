@echo off
title Creando Paquete para Escritorio
color 0B
cls

echo.
echo     ╔══════════════════════════════════════════════════════╗
echo     ║        🚗 SISTEMA DE LAVADO PEÑA BLANCA 🚗          ║
echo     ║            CREANDO PAQUETE PARA ESCRITORIO           ║
echo     ╚══════════════════════════════════════════════════════╝
echo.
echo  📦 Preparando archivos para tu escritorio...
echo.

REM Crear directorio de distribución
if exist "CarwashPenaBlanca-Escritorio" rmdir /s /q "CarwashPenaBlanca-Escritorio"
mkdir "CarwashPenaBlanca-Escritorio"

REM Copiar archivos necesarios
echo  📁 Copiando archivos del sistema...
xcopy /E /I /Q "client" "CarwashPenaBlanca-Escritorio\client"
xcopy /E /I /Q "server" "CarwashPenaBlanca-Escritorio\server"
xcopy /E /I /Q "shared" "CarwashPenaBlanca-Escritorio\shared"
xcopy /E /I /Q "node_modules" "CarwashPenaBlanca-Escritorio\node_modules"

REM Copiar archivos de configuración
copy "package.json" "CarwashPenaBlanca-Escritorio\"
copy "package-lock.json" "CarwashPenaBlanca-Escritorio\"
copy "tsconfig.json" "CarwashPenaBlanca-Escritorio\"
copy "vite.config.ts" "CarwashPenaBlanca-Escritorio\"
copy "tailwind.config.ts" "CarwashPenaBlanca-Escritorio\"
copy "postcss.config.js" "CarwashPenaBlanca-Escritorio\"
copy "components.json" "CarwashPenaBlanca-Escritorio\"

REM Copiar launchers
copy "APLICACION-INDEPENDIENTE.bat" "CarwashPenaBlanca-Escritorio\"
copy "SISTEMA-LAVADO-DEFINITIVO.bat" "CarwashPenaBlanca-Escritorio\"

REM Crear archivo de instrucciones
echo  📋 Creando instrucciones...
echo # 🚗 SISTEMA DE LAVADO PEÑA BLANCA - ESCRITORIO > "CarwashPenaBlanca-Escritorio\INSTRUCCIONES.md"
echo. >> "CarwashPenaBlanca-Escritorio\INSTRUCCIONES.md"
echo ## INSTALACIÓN EN TU ESCRITORIO >> "CarwashPenaBlanca-Escritorio\INSTRUCCIONES.md"
echo. >> "CarwashPenaBlanca-Escritorio\INSTRUCCIONES.md"
echo 1. Copiar toda la carpeta "CarwashPenaBlanca-Escritorio" a tu escritorio >> "CarwashPenaBlanca-Escritorio\INSTRUCCIONES.md"
echo 2. Doble clic en: APLICACION-INDEPENDIENTE.bat >> "CarwashPenaBlanca-Escritorio\INSTRUCCIONES.md"
echo 3. ¡Listo! Tu sistema funciona completamente offline >> "CarwashPenaBlanca-Escritorio\INSTRUCCIONES.md"
echo. >> "CarwashPenaBlanca-Escritorio\INSTRUCCIONES.md"
echo ## CARACTERÍSTICAS >> "CarwashPenaBlanca-Escritorio\INSTRUCCIONES.md"
echo - ✅ Base de datos SQLite local >> "CarwashPenaBlanca-Escritorio\INSTRUCCIONES.md"
echo - ✅ Funciona sin internet >> "CarwashPenaBlanca-Escritorio\INSTRUCCIONES.md"
echo - ✅ Todos los datos se guardan permanentemente >> "CarwashPenaBlanca-Escritorio\INSTRUCCIONES.md"
echo - ✅ No depende de Replit ni servidores externos >> "CarwashPenaBlanca-Escritorio\INSTRUCCIONES.md"

echo.
echo  ✅ PAQUETE CREADO EXITOSAMENTE!
echo.
echo  📂 Ubicación: CarwashPenaBlanca-Escritorio\
echo.
echo  🚀 PRÓXIMOS PASOS:
echo     1. Copiar la carpeta "CarwashPenaBlanca-Escritorio" a tu escritorio
echo     2. En tu escritorio, doble clic en: APLICACION-INDEPENDIENTE.bat
echo     3. ¡Tu sistema estará funcionando completamente independiente!
echo.
echo  📋 El sistema incluye todo lo necesario para funcionar offline
echo.
pause