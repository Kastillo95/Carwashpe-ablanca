const { app, BrowserWindow } = require('electron');
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
});