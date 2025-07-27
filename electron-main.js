const { app, BrowserWindow } = require('electron');
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
});