const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');

// Mantener referencia global de la ventana
let mainWindow;
let serverProcess;

// Configurar directorio de datos portable
const isPortable = process.env.PORTABLE === 'true' || process.argv.includes('--portable');
if (isPortable) {
  const portableDir = path.join(process.execPath, '..', 'CarwashData');
  app.setPath('userData', portableDir);
}

function createWindow() {
  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    show: false,
    titleBarStyle: 'default',
    title: 'Carwash Peña Blanca - Sistema de Gestión'
  });

  // Remover menu bar (opcional)
  Menu.setApplicationMenu(null);

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Manejar enlaces externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

function startServer() {
  return new Promise((resolve, reject) => {
    // Iniciar el servidor Express
    const isDev = process.env.NODE_ENV === 'development';
    const serverScript = isDev ? 'server/index.ts' : 'dist/index.js';
    const command = isDev ? 'tsx' : 'node';
    
    serverProcess = spawn(command, [serverScript], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '3001',
        ELECTRON_MODE: 'true',
        DATABASE_URL: `file:${path.join(app.getPath('userData'), 'carwash.db')}`
      },
      stdio: 'inherit'
    });

    serverProcess.on('error', (error) => {
      console.error('Error starting server:', error);
      reject(error);
    });

    // Esperar a que el servidor esté listo
    waitOn({
      resources: ['http://localhost:3001'],
      delay: 1000,
      interval: 100,
      timeout: 30000
    }).then(() => {
      resolve();
    }).catch(reject);
  });
}

app.whenReady().then(async () => {
  try {
    // Iniciar servidor
    await startServer();
    
    // Crear ventana
    createWindow();
    
    // Cargar la aplicación
    mainWindow.loadURL('http://localhost:3001');
    
  } catch (error) {
    console.error('Error starting application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});