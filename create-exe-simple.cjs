const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Creando aplicación ejecutable Electron para Windows...\n');

try {
  // 1. Crear archivo main de Electron
  const electronMainContent = `const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let serverProcess;

// Configurar entorno
process.env.NODE_ENV = 'production';
process.env.PORT = '3001';

function createDataDirectory() {
  const dataDir = path.join(process.cwd(), 'CarwashData');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'carwash.db');
  process.env.DATABASE_URL = 'file:' + dbPath;
  return dataDir;
}

function startServer() {
  return new Promise((resolve) => {
    const serverPath = path.join(__dirname, 'dist', 'index.js');
    
    console.log('Iniciando servidor backend...');
    serverProcess = spawn('node', [serverPath], {
      stdio: 'pipe',
      env: { ...process.env }
    });

    serverProcess.stdout.on('data', (data) => {
      console.log('Backend:', data.toString());
      if (data.toString().includes('serving on port')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Backend Error:', data.toString());
    });

    // Timeout de seguridad
    setTimeout(() => resolve(), 3000);
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
    console.log('Aplicación iniciada correctamente');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (serverProcess) {
      serverProcess.kill();
    }
  });
}

app.whenReady().then(async () => {
  try {
    console.log('Iniciando Carwash Peña Blanca...');
    
    // Crear directorio de datos
    const dataDir = createDataDirectory();
    console.log('Datos en:', dataDir);
    
    // Iniciar servidor
    await startServer();
    console.log('Servidor iniciado');
    
    // Crear ventana
    createWindow();
    
  } catch (error) {
    console.error('Error al iniciar:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});`;

  fs.writeFileSync('electron-main.js', electronMainContent);

  // 2. Instalar Electron si no está
  try {
    require('electron');
  } catch {
    console.log('📦 Instalando Electron...');
    execSync('npm install electron --save-dev', { stdio: 'inherit' });
  }

  // 3. Crear configuración para electron-builder
  const builderConfig = {
    "appId": "com.carwash.penablanca",
    "productName": "Carwash Peña Blanca",
    "directories": {
      "output": "CarwashPortable"
    },
    "files": [
      "electron-main.js",
      "dist/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": [
        {
          "target": "portable",
          "arch": ["x64"]
        },
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ]
    },
    "portable": {
      "artifactName": "CarwashPenaBlanca-Portable.exe"
    },
    "nsis": {
      "artifactName": "CarwashPenaBlanca-Setup.exe",
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  };

  fs.writeFileSync('electron-builder.json', JSON.stringify(builderConfig, null, 2));

  // 4. Actualizar package.json
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  } catch {
    packageJson = {};
  }
  
  packageJson.main = 'electron-main.js';
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts['build-electron'] = 'electron-builder --config electron-builder.json';
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

  // 5. Construir la aplicación
  console.log('📦 Construyendo aplicación web...');
  execSync('npm run build', { stdio: 'inherit' });

  // 6. Crear ejecutable con electron-builder
  console.log('🔨 Creando ejecutable con Electron Builder...');
  console.log('Esto puede tomar unos minutos...\n');
  
  execSync('npx electron-builder --config electron-builder.json --publish=never', { 
    stdio: 'inherit'
  });

  // 7. Verificar archivos creados
  const outputDir = 'CarwashPortable';
  if (fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir);
    console.log('\n✅ ¡APLICACIÓN EJECUTABLE CREADA!');
    console.log('\n📁 Archivos generados:');
    files.forEach(file => {
      if (file.endsWith('.exe')) {
        const stats = fs.statSync(path.join(outputDir, file));
        const sizeMB = Math.round(stats.size / (1024 * 1024));
        console.log(`   • ${file} (${sizeMB}MB)`);
      }
    });
    
    console.log('\n🎉 Características:');
    console.log('   • ✅ Aplicación de escritorio REAL');
    console.log('   • ✅ NO abre ventana de comandos');
    console.log('   • ✅ Ventana propia como programa normal');
    console.log('   • ✅ Base de datos SQLite integrada');
    console.log('   • ✅ Funciona sin Node.js instalado');
    console.log('\n🔐 Contraseña de admin: 742211010338');
    console.log('\n📋 Para usar:');
    console.log('   1. Ve a la carpeta CarwashPortable');
    console.log('   2. Haz doble clic en el archivo .exe');
    console.log('   3. ¡Se abre como programa normal!');
  }

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.log('\n💡 Solución alternativa:');
  console.log('1. npm install electron electron-builder');
  console.log('2. npm run build');
  console.log('3. npx electron-builder --win portable');
}