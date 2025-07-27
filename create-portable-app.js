import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Creando aplicación ejecutable real (.exe) para Windows...\n');

try {
  // 1. Verificar que la aplicación esté construida
  if (!fs.existsSync('dist/index.js')) {
    console.log('📦 Construyendo aplicación...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  // 2. Crear configuración para pkg (empaquetador de Node.js)
  const pkgConfig = {
    "name": "carwash-pena-blanca",
    "version": "1.0.0",
    "main": "dist/index.js",
    "bin": "dist/index.js",
    "pkg": {
      "scripts": ["dist/**/*.js"],
      "assets": ["dist/public/**/*"],
      "targets": ["node18-win-x64"],
      "outputPath": "build"
    }
  };

  fs.writeFileSync('package-exe.json', JSON.stringify(pkgConfig, null, 2));

  // 3. Crear script de inicio para la aplicación empaquetada
  const launcherScript = `const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configurar variables de entorno
process.env.NODE_ENV = 'production';
process.env.PORT = '3001';
process.env.ELECTRON_MODE = 'true';

// Crear directorio de datos
const dataDir = path.join(process.cwd(), 'CarwashData');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
process.env.DATABASE_URL = \`file:\${path.join(dataDir, 'carwash.db')}\`;

console.log('🚀 Iniciando Carwash Peña Blanca...');
console.log('📁 Datos en:', dataDir);

// Función para abrir navegador
function openBrowser(url) {
  const start = process.platform === 'darwin' ? 'open' : 
                process.platform === 'win32' ? 'start ""' : 'xdg-open';
  
  setTimeout(() => {
    try {
      require('child_process').exec(\`\${start} \${url}\`);
    } catch (error) {
      console.log('Abre manualmente:', url);
    }
  }, 2000);
}

// Iniciar servidor
require('./dist/index.js');

// Abrir navegador después de que el servidor esté listo
openBrowser('http://localhost:3001');

console.log('✅ Aplicación iniciada en http://localhost:3001');
console.log('🔐 Contraseña de admin: 742211010338');
console.log('📊 Para cerrar la aplicación, presiona Ctrl+C');`;

  fs.writeFileSync('launcher.js', launcherScript);

  // 4. Instalar pkg si no está disponible
  try {
    execSync('pkg --version', { stdio: 'ignore' });
  } catch {
    console.log('📦 Instalando empaquetador pkg...');
    execSync('npm install -g pkg', { stdio: 'inherit' });
  }

  // 5. Crear el ejecutable
  console.log('🔨 Creando ejecutable (.exe)...');
  console.log('Esto puede tomar unos minutos...\n');

  // Usar pkg para crear el ejecutable
  execSync('pkg launcher.js --targets node18-win-x64 --output build/CarwashPenaBlanca.exe', { 
    stdio: 'inherit' 
  });

  // 6. Crear instalador simple
  console.log('📁 Creando carpeta de distribución...');
  
  if (!fs.existsSync('build')) fs.mkdirSync('build');
  
  // Copiar archivos necesarios
  if (fs.existsSync('dist/public')) {
    execSync('cp -r dist/public build/', { stdio: 'ignore' });
  }

  // Crear script de instalación
  const installScript = `@echo off
echo.
echo ========================================
echo   INSTALADOR CARWASH PEÑA BLANCA
echo ========================================
echo.

set INSTALL_DIR=%ProgramFiles%\\CarwashPenaBlanca
set DESKTOP=%USERPROFILE%\\Desktop

echo Instalando en: %INSTALL_DIR%
echo.

REM Crear directorio de instalación
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Copiar archivos
copy "CarwashPenaBlanca.exe" "%INSTALL_DIR%\\"
if exist "public" xcopy "public" "%INSTALL_DIR%\\public\\" /E /I /Y

REM Crear acceso directo en escritorio
echo [InternetShortcut] > "%DESKTOP%\\Carwash Peña Blanca.url"
echo URL=file:///%INSTALL_DIR%\\CarwashPenaBlanca.exe >> "%DESKTOP%\\Carwash Peña Blanca.url"

echo.
echo ✅ Instalación completada!
echo.
echo 🖥️  Acceso directo creado en el escritorio
echo 📁 Instalado en: %INSTALL_DIR%
echo 🔐 Contraseña de admin: 742211010338
echo.
echo Para ejecutar: Doble clic en "Carwash Peña Blanca" en el escritorio
echo.
pause`;

  fs.writeFileSync('build/INSTALAR.bat', installScript);

  // 7. Crear README para el ejecutable
  const readmeExe = `# CARWASH PEÑA BLANCA - APLICACIÓN EJECUTABLE

## ✅ APLICACIÓN LISTA PARA INSTALAR

### 📁 Archivos incluidos:
- CarwashPenaBlanca.exe     ← Aplicación principal
- INSTALAR.bat              ← Instalador automático
- public/                   ← Archivos de la interfaz

### 🚀 INSTALACIÓN AUTOMÁTICA:
1. Haz doble clic en "INSTALAR.bat"
2. Se instalará automáticamente en Archivos de Programa
3. Se creará acceso directo en el escritorio
4. ¡Listo para usar!

### 🖥️ USO MANUAL (sin instalar):
1. Doble clic en "CarwashPenaBlanca.exe"
2. Se abre automáticamente en tu navegador
3. URL: http://localhost:3001

### 🔐 ACCESO:
- Contraseña de administrador: 742211010338

### 💾 DATOS:
- Se crean automáticamente en carpeta "CarwashData"
- Base de datos SQLite local
- No requiere internet

### ✅ CARACTERÍSTICAS:
- ✅ Ejecutable independiente (.exe)
- ✅ No requiere Node.js instalado
- ✅ Instalador automático incluido
- ✅ Acceso directo en escritorio
- ✅ Base de datos local
- ✅ Funciona sin internet
- ✅ Sistema completo de gestión

¡Tu aplicación está lista para distribuir!`;

  fs.writeFileSync('build/README-EJECUTABLE.txt', readmeExe);

  console.log('\n✅ ¡EJECUTABLE CREADO EXITOSAMENTE!');
  console.log('\n📁 Ubicación: build/CarwashPenaBlanca.exe');
  console.log('\n🎉 Características del ejecutable:');
  console.log('   • ✅ Archivo .exe independiente');
  console.log('   • ✅ NO requiere Node.js');
  console.log('   • ✅ NO requiere instalación');
  console.log('   • ✅ Instalador automático incluido');
  console.log('   • ✅ Acceso directo en escritorio');
  console.log('   • ✅ Base de datos SQLite integrada');
  console.log('   • ✅ Funciona completamente sin internet');
  console.log('\n📋 Para distribuir:');
  console.log('   1. Copia la carpeta "build" completa');
  console.log('   2. En la PC de destino, ejecuta "INSTALAR.bat"');
  console.log('   3. O ejecuta directamente "CarwashPenaBlanca.exe"');
  console.log('\n🔐 Contraseña de admin: 742211010338');

} catch (error) {
  console.error('\n❌ Error creando ejecutable:', error.message);
  console.log('\n💡 Intentando método alternativo...');
  
  // Método alternativo usando nexe
  try {
    console.log('📦 Instalando nexe...');
    execSync('npm install -g nexe', { stdio: 'inherit' });
    
    console.log('🔨 Creando ejecutable con nexe...');
    execSync('nexe dist/index.js -t windows-x64-18.20.4 -o build/CarwashPenaBlanca.exe', { 
      stdio: 'inherit' 
    });
    
    console.log('\n✅ Ejecutable creado con método alternativo!');
  } catch (nexeError) {
    console.error('\n❌ Error con método alternativo:', nexeError.message);
    console.log('\n🔧 Solución manual:');
    console.log('   1. Instala pkg globalmente: npm install -g pkg');
    console.log('   2. Ejecuta: pkg dist/index.js --targets node18-win-x64 --output build/CarwashPenaBlanca.exe');
  }
}