#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Construyendo aplicación portable del Carwash...\n');

try {
  // 1. Construir la aplicación web
  console.log('📦 1. Construyendo aplicación web...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. Construir aplicación Electron
  console.log('\n🖥️  2. Construyendo aplicación Electron...');
  execSync('npx electron-builder --win portable --x64', { stdio: 'inherit' });
  
  console.log('\n✅ ¡Aplicación portable creada exitosamente!');
  console.log('\n📁 Tu aplicación está en la carpeta "dist"');
  console.log('💡 Busca el archivo .exe para instalar en cualquier PC');
  console.log('\n🎉 Características de tu aplicación portable:');
  console.log('   • No requiere instalación');
  console.log('   • Guarda datos localmente');
  console.log('   • Funciona sin internet');
  console.log('   • Base de datos SQLite incluida');
  console.log('   • Copia y ejecuta en cualquier PC Windows');
  
} catch (error) {
  console.error('\n❌ Error construyendo la aplicación:', error.message);
  process.exit(1);
}