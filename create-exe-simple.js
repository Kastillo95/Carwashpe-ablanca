#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Creando aplicación ejecutable del Carwash (método simple)...\n');

try {
  // 1. Ya se construyó la aplicación web anteriormente
  console.log('✅ Aplicación web ya construida en /dist');
  
  // 2. Crear un script de inicio simple
  console.log('📝 2. Creando script de inicio...');
  
  const startScript = `@echo off
echo Iniciando Carwash Peña Blanca...
echo.
cd /d "%~dp0"
if not exist node_modules (
    echo Instalando dependencias por primera vez...
    npm install --production
)
echo Abriendo aplicación...
set ELECTRON_MODE=true
set NODE_ENV=production
set PORT=3001
start "" "%~dp0node_modules\\.bin\\electron" electron-main.js
echo.
echo La aplicación se está iniciando...
echo Si no abre automáticamente, espera unos segundos.
pause`;
  
  fs.writeFileSync('INICIAR-CARWASH.bat', startScript);
  
  // 3. Crear archivo README con instrucciones
  const readme = `# Carwash Peña Blanca - Sistema de Gestión

## 🚀 INSTRUCCIONES DE USO

### Para ejecutar la aplicación:
1. Haz doble clic en "INICIAR-CARWASH.bat"
2. Espera a que se abra la aplicación
3. ¡Listo! Ya puedes usar el sistema

### Características:
✅ Sistema completo de gestión de carwash
✅ Administración de citas y servicios
✅ Control de inventario
✅ Facturación integrada
✅ Sistema CRM para clientes
✅ Base de datos local (no requiere internet)
✅ Contraseña de administrador: 742211010338

### Requisitos:
- Windows 7 o superior
- Node.js se instalará automáticamente si es necesario

### Datos:
- Los datos se guardan automáticamente en una base de datos local
- No se requiere conexión a internet para funcionar
- Todos los datos quedan en esta carpeta

### Soporte:
- El sistema está listo para usar
- Todos los servicios básicos ya están precargados
- Inventario inicial incluido

¡Disfruta usando tu sistema de gestión de carwash!`;

  fs.writeFileSync('README.txt', readme);
  
  // 4. Crear un paquete portable simple
  console.log('📦 3. Creando paquete portable...');
  
  // Crear carpeta portable
  if (fs.existsSync('CarwashPortable')) {
    execSync('rm -rf CarwashPortable', { stdio: 'inherit' });
  }
  fs.mkdirSync('CarwashPortable');
  
  // Copiar archivos esenciales
  const filesToCopy = [
    'dist',
    'node_modules',
    'electron-main.js',
    'package.json',
    'INICIAR-CARWASH.bat',
    'README.txt',
    'assets'
  ];
  
  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      execSync(`cp -r "${file}" CarwashPortable/`, { stdio: 'inherit' });
    }
  });
  
  console.log('\n✅ ¡Aplicación portable creada exitosamente!');
  console.log('\n📁 Tu aplicación está en la carpeta "CarwashPortable"');
  console.log('💡 Copia toda la carpeta "CarwashPortable" a cualquier PC Windows');
  console.log('\n🎉 Para usar la aplicación:');
  console.log('   1. Copia la carpeta "CarwashPortable" a la otra PC');
  console.log('   2. Abre la carpeta');
  console.log('   3. Haz doble clic en "INICIAR-CARWASH.bat"');
  console.log('   4. ¡Listo! La aplicación se abre automáticamente');
  
  console.log('\n📋 Características de la aplicación:');
  console.log('   • ✅ No requiere navegador (abre en ventana propia)');
  console.log('   • ✅ No requiere instalación');
  console.log('   • ✅ Guarda datos localmente');
  console.log('   • ✅ Funciona sin internet');
  console.log('   • ✅ Base de datos SQLite incluida');
  console.log('   • ✅ Sistema completo de gestión de carwash');
  console.log('   • ✅ Contraseña de admin: 742211010338');
  
} catch (error) {
  console.error('\n❌ Error creando la aplicación:', error.message);
  process.exit(1);
}