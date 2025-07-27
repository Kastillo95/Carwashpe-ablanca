const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Iniciando aplicación Carwash en modo Electron...\n');

try {
  // Construir la aplicación primero
  if (!fs.existsSync('./dist')) {
    console.log('📦 Construyendo aplicación...');
    execSync('npm run build', { stdio: 'inherit' });
  }
  
  // Iniciar Electron
  console.log('🖥️  Iniciando Electron...');
  execSync('npx electron electron-main.js', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}