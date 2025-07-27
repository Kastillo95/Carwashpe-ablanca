const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const express = require('express');
const fs = require('fs');

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
    try {
      console.log('🚀 Iniciando servidor interno...');
      
      // Crear servidor Express simple
      const server = express();
      const port = 3001;
      
      // Configurar archivos estáticos
      const staticPath = path.join(__dirname, 'dist', 'public');
      if (fs.existsSync(staticPath)) {
        server.use(express.static(staticPath));
      }
      
      // Ruta principal
      server.get('/', (req, res) => {
        const indexPath = path.join(__dirname, 'dist', 'public', 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.send(`
            <h1>🚗 Carwash Peña Blanca</h1>
            <p>Sistema inicializando...</p>
            <p>Si ves este mensaje, la aplicación está funcionando.</p>
          `);
        }
      });
      
      // API básica para probar
      server.get('/api/test', (req, res) => {
        res.json({ status: 'ok', message: '¡Servidor funcionando!' });
      });
      
      // Iniciar servidor
      server.listen(port, '127.0.0.1', () => {
        console.log(`✅ Servidor iniciado en http://localhost:${port}`);
        resolve();
      });
      
    } catch (error) {
      console.error('❌ Error iniciando servidor:', error);
      reject(error);
    }
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