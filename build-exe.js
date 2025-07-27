#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Construyendo aplicación ejecutable del Carwash...\n');

try {
  // 1. Construir la aplicación web
  console.log('📦 1. Construyendo aplicación web...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. Crear directorio de assets si no existe
  if (!fs.existsSync('assets')) {
    fs.mkdirSync('assets');
  }
  
  // 3. Crear un ícono básico si no existe
  if (!fs.existsSync('assets/icon.png')) {
    console.log('📷 2. Creando ícono básico...');
    // Crear un ícono SVG básico y convertirlo
    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="#2563eb" rx="32"/>
      <path d="M64 192h128v16H64zm32-32h64v16H96zm-16-32h96v16H80zm8-32h80v16H88z" fill="white"/>
      <text x="128" y="80" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">CW</text>
    </svg>`;
    fs.writeFileSync('assets/icon.svg', iconSvg);
  }
  
  // 4. Construir aplicación Electron
  console.log('\n🖥️  3. Construyendo aplicación Electron portable...');
  execSync('npx electron-builder --win portable --x64', { stdio: 'inherit' });
  
  console.log('\n✅ ¡Aplicación ejecutable creada exitosamente!');
  console.log('\n📁 Tu aplicación está en la carpeta "build"');
  console.log('💡 Busca el archivo "CarwashPenaBlanca-Portable.exe"');
  console.log('\n🎉 Características de tu aplicación:');
  console.log('   • ✅ Archivo .exe independiente');
  console.log('   • ✅ No requiere instalación');
  console.log('   • ✅ No requiere navegador');
  console.log('   • ✅ Guarda datos localmente (SQLite)');
  console.log('   • ✅ Funciona sin internet');
  console.log('   • ✅ Solo copiar y ejecutar en cualquier PC Windows');
  console.log('   • ✅ Datos guardados en carpeta CarwashData');
  console.log('\n📋 Instrucciones:');
  console.log('   1. Copia el archivo .exe a la otra PC');
  console.log('   2. Haz doble clic para ejecutar');
  console.log('   3. ¡Listo! El programa abre automáticamente');
  
} catch (error) {
  console.error('\n❌ Error construyendo la aplicación:', error.message);
  console.log('\n💡 Verifica que tengas todos los paquetes instalados:');
  console.log('   npm install');
  process.exit(1);
}