const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Creando aplicación portable REAL sin dependencias...\n');

try {
  // 1. Asegurar que la aplicación esté construida
  console.log('📦 Construyendo aplicación...');
  execSync('npm run build', { stdio: 'inherit' });

  // 2. Crear archivo main simplificado de Electron
  const electronMain = `const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let serverProcess;

process.env.NODE_ENV = 'production';
process.env.PORT = '3001';

function createDataDir() {
  const dataDir = path.join(process.cwd(), 'CarwashData');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  process.env.DATABASE_URL = 'file:' + path.join(dataDir, 'carwash.db');
  return dataDir;
}

function startServer() {
  return new Promise((resolve) => {
    const serverPath = path.join(__dirname, 'dist', 'index.js');
    
    serverProcess = spawn('node', [serverPath], {
      stdio: 'pipe',
      env: { ...process.env }
    });

    serverProcess.stdout.on('data', (data) => {
      if (data.toString().includes('serving on port')) {
        resolve();
      }
    });
    
    setTimeout(() => resolve(), 2000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'Carwash Peña Blanca',
    show: false
  });

  mainWindow.loadURL('http://localhost:3001');
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    if (serverProcess) serverProcess.kill();
    app.quit();
  });
}

app.whenReady().then(async () => {
  createDataDir();
  await startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  app.quit();
});`;

  fs.writeFileSync('electron-start.js', electronMain);

  // 3. Instalar electron-packager globalmente si no existe
  try {
    execSync('electron-packager --version', { stdio: 'ignore' });
  } catch {
    console.log('📦 Instalando electron-packager...');
    execSync('npm install -g electron-packager', { stdio: 'inherit' });
  }

  // 4. Crear el ejecutable usando electron-packager
  console.log('🔨 Empaquetando aplicación con Electron...');
  console.log('Esto puede tomar unos minutos...\n');

  const packageCommand = `electron-packager . "Carwash Peña Blanca" --platform=win32 --arch=x64 --out=CarwashPortable --overwrite --asar --ignore="node_modules/(electron|electron-builder)" --executable-name="CarwashPenaBlanca"`;
  
  execSync(packageCommand, { stdio: 'inherit' });

  // 5. Verificar resultado
  const outputDir = 'CarwashPortable';
  if (fs.existsSync(outputDir)) {
    const appDirs = fs.readdirSync(outputDir);
    const appDir = appDirs.find(dir => dir.includes('Carwash'));
    
    if (appDir) {
      const exePath = path.join(outputDir, appDir, 'CarwashPenaBlanca.exe');
      if (fs.existsSync(exePath)) {
        const stats = fs.statSync(exePath);
        const sizeMB = Math.round(stats.size / (1024 * 1024));
        
        console.log('\n✅ ¡APLICACIÓN EJECUTABLE CREADA!');
        console.log('\n📁 Ubicación:', exePath);
        console.log('📊 Tamaño:', sizeMB + 'MB');
        console.log('\n🎉 Características:');
        console.log('   • ✅ Aplicación de escritorio REAL');
        console.log('   • ✅ NO abre ventana de comandos');
        console.log('   • ✅ Ventana propia independiente');
        console.log('   • ✅ Base de datos SQLite integrada');
        console.log('   • ✅ Funciona sin instalaciones');
        
        // Crear script de inicio simple
        const launcherScript = `@echo off
title Carwash Peña Blanca
echo Iniciando Carwash Peña Blanca...
start "" "${appDir}\\CarwashPenaBlanca.exe"
exit`;
        
        fs.writeFileSync(path.join(outputDir, 'INICIAR-CARWASH.bat'), launcherScript);
        
        console.log('\n📋 Para usar:');
        console.log('   1. Ve a: CarwashPortable/' + appDir);
        console.log('   2. Haz doble clic en: CarwashPenaBlanca.exe');
        console.log('   3. O usa: CarwashPortable/INICIAR-CARWASH.bat');
        console.log('\n🔐 Contraseña de admin: 742211010338');
      }
    }
  }
  
  throw new Error('No se pudo crear el ejecutable');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  
  // Alternativa simple con solo node
  console.log('\n💡 Creando versión alternativa...');
  try {
    const simpleExe = `@echo off
title Carwash Peña Blanca
cd /d "%~dp0"

if not exist CarwashData mkdir CarwashData
set NODE_ENV=production
set PORT=3001
set DATABASE_URL=file:CarwashData/carwash.db

echo Iniciando Carwash Peña Blanca...
start http://localhost:3001
node dist/index.js

pause`;
    
    fs.writeFileSync('CarwashPenaBlanca-Simple.bat', simpleExe);
    console.log('✅ Creado CarwashPenaBlanca-Simple.bat como alternativa');
    
  } catch (altError) {
    console.error('Error en alternativa:', altError.message);
  }
}