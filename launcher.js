const { spawn } = require('child_process');
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
process.env.DATABASE_URL = `file:${path.join(dataDir, 'carwash.db')}`;

console.log('🚀 Iniciando Carwash Peña Blanca...');
console.log('📁 Datos en:', dataDir);

// Función para abrir navegador
function openBrowser(url) {
  const start = process.platform === 'darwin' ? 'open' : 
                process.platform === 'win32' ? 'start ""' : 'xdg-open';
  
  setTimeout(() => {
    try {
      require('child_process').exec(`${start} ${url}`);
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
console.log('📊 Para cerrar la aplicación, presiona Ctrl+C');