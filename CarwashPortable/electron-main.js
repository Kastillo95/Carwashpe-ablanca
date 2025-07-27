const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Variables globales
let mainWindow;
let serverProcess;
const PORT = 3001;

// Configurar variables de entorno para modo portable
process.env.ELECTRON_MODE = 'true';
process.env.NODE_ENV = 'production';
process.env.PORT = PORT;

// Configurar ruta de base de datos en carpeta CarwashData
const appDir = process.cwd();
const dataDir = path.join(appDir, 'CarwashData');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
process.env.DATABASE_URL = `file:${path.join(dataDir, 'carwash.db')}`;

console.log('🚀 Iniciando Carwash Peña Blanca...');
console.log('📁 Directorio de datos:', dataDir);
console.log('💾 Base de datos:', process.env.DATABASE_URL);

function createWindow() {
  // Crear ventana principal
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'Carwash Peña Blanca - Sistema de Gestión',
    show: false, // No mostrar hasta que esté listo
    autoHideMenuBar: true, // Ocultar barra de menú
    resizable: true,
    minWidth: 800,
    minHeight: 600
  });

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ Ventana de aplicación mostrada');
  });

  // Intentar cargar la aplicación
  const tryLoadApp = (attempts = 0) => {
    if (attempts > 30) { // 30 segundos máximo
      dialog.showErrorBox(
        'Error de Conexión',
        'No se pudo conectar al servidor de la aplicación.\n\nVerifica que Node.js esté instalado correctamente.'
      );
      app.quit();
      return;
    }

    mainWindow.loadURL(`http://localhost:${PORT}`)
      .then(() => {
        console.log('✅ Aplicación cargada correctamente');
      })
      .catch(() => {
        console.log(`⏳ Intento ${attempts + 1}/30 - Esperando servidor...`);
        setTimeout(() => tryLoadApp(attempts + 1), 1000);
      });
  };

  // Iniciar intento de carga
  tryLoadApp();

  // Manejar cierre de ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (serverProcess) {
      console.log('🛑 Cerrando servidor...');
      serverProcess.kill();
    }
  });
}

function startServer() {
  console.log('🖥️ Iniciando servidor backend...');
  
  // Verificar que existe el archivo del servidor
  const serverFile = path.join(__dirname, 'dist', 'index.js');
  if (!fs.existsSync(serverFile)) {
    dialog.showErrorBox(
      'Error de Aplicación',
      'No se encontró el archivo del servidor.\n\nVerifica que todos los archivos estén copiados correctamente.'
    );
    app.quit();
    return;
  }

  // Iniciar servidor Node.js
  serverProcess = spawn('node', [serverFile], {
    cwd: __dirname,
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`[SERVER] ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[SERVER ERROR] ${data.toString().trim()}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`🛑 Servidor cerrado con código: ${code}`);
  });

  serverProcess.on('error', (err) => {
    console.error('❌ Error iniciando servidor:', err);
    dialog.showErrorBox(
      'Error del Servidor',
      `No se pudo iniciar el servidor:\n${err.message}\n\nVerifica que Node.js esté instalado.`
    );
    app.quit();
  });

  console.log('✅ Servidor iniciado');
}

// Eventos de la aplicación
app.whenReady().then(() => {
  console.log('📱 Electron listo');
  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada:', reason);
});