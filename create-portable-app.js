import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Creando aplicación portable súper simple...\n');

// Crear carpeta para la aplicación portable
const appDir = './CarwashPortable';
if (fs.existsSync(appDir)) {
  fs.rmSync(appDir, { recursive: true });
}
fs.mkdirSync(appDir);

console.log('📦 Copiando archivos necesarios...');

// Copiar archivos de la aplicación construida
execSync(`cp -r dist ${appDir}/`);
execSync(`cp electron-main.js ${appDir}/`);
execSync(`cp package.json ${appDir}/`);

// Crear un package.json simplificado
const simplePackage = {
  "name": "carwash-portable",
  "version": "1.0.0",
  "main": "electron-main.js",
  "dependencies": {
    "electron": "^37.2.4",
    "express": "^4.21.2",
    "better-sqlite3": "^9.0.0",
    "drizzle-orm": "^0.39.1"
  }
};

fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify(simplePackage, null, 2));

// Crear script de inicio
const startScript = `@echo off
echo 🚀 Iniciando Carwash Peña Blanca...
echo.
echo ⏳ Espera un momento mientras se carga...
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado en este sistema
    echo.
    echo 💡 Descarga e instala Node.js desde: https://nodejs.org
    echo    (Versión recomendada: LTS)
    echo.
    pause
    exit /b 1
)

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo 📦 Instalando componentes necesarios...
    npm install --production --silent
)

REM Iniciar la aplicación
echo ✅ Abriendo aplicación...
npm start

pause`;

fs.writeFileSync(path.join(appDir, 'INICIAR-CARWASH.bat'), startScript);

// Crear README simple
const readme = `# 🚗 Carwash Peña Blanca - Aplicación Portable

## 📋 INSTRUCCIONES SÚPER FÁCILES:

### 1️⃣ PRIMERA VEZ (Solo una vez):
- Descarga e instala Node.js desde: https://nodejs.org (elige la versión LTS)
- Es una instalación normal de Windows, siguiente-siguiente-finalizar

### 2️⃣ USAR LA APLICACIÓN:
- Haz doble clic en: **INICIAR-CARWASH.bat**
- Espera unos segundos
- Se abrirá automáticamente en tu navegador
- ¡Listo para usar!

### 🔄 USAR EN OTRA PC:
- Copia toda esta carpeta "CarwashPortable"
- Instala Node.js en la nueva PC (solo la primera vez)
- Ejecuta INICIAR-CARWASH.bat

### 💾 TUS DATOS:
- Se guardan automáticamente en: carwash.db
- Están dentro de esta misma carpeta
- Para hacer backup: copia el archivo carwash.db

### 🆘 SI NO FUNCIONA:
- Verifica que Node.js esté instalado
- Ejecuta desde cmd para ver errores
- Algunos antivirus pueden bloquearlo

## ✅ VENTAJAS:
- Solo necesitas Node.js (instalación única)
- Todos tus datos en una carpeta
- Copia la carpeta = tienes todo tu sistema
- Funciona sin internet
- Incluye todas las funciones completas

¡Tu sistema profesional de carwash listo para usar! 🎉`;

fs.writeFileSync(path.join(appDir, 'README.txt'), readme);

// Crear script para npm start
const packageJsonPath = path.join(appDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
pkg.scripts = {
  "start": "node electron-main.js"
};
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));

console.log('✅ ¡Aplicación portable creada!');
console.log('📁 Ubicación: ./CarwashPortable/');
console.log('🎉 Para usar: ejecuta INICIAR-CARWASH.bat');
console.log('');
console.log('🚀 Tu aplicación está lista para copiar a cualquier PC');