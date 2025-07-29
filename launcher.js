const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando Sistema de Lavado Peña Blanca...');

// Verificar si las dependencias están instaladas
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('📦 Instalando dependencias por primera vez...');
    const install = spawn('npm', ['install'], { 
        stdio: 'inherit',
        shell: true,
        cwd: __dirname
    });
    
    install.on('close', (code) => {
        if (code === 0) {
            startApplication();
        } else {
            console.error('❌ Error instalando dependencias');
            process.exit(1);
        }
    });
} else {
    startApplication();
}

function startApplication() {
    console.log('🌐 Iniciando servidor...');
    
    // Iniciar servidor sin mostrar ventana
    const server = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        shell: true,
        cwd: __dirname,
        detached: false
    });
    
    server.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('serving on port')) {
            console.log('✅ Servidor iniciado exitosamente');
            console.log('🌐 Abriendo navegador...');
            
            // Abrir navegador después de un delay
            setTimeout(() => {
                const { exec } = require('child_process');
                exec('start http://localhost:5000');
                
                console.log('📊 Sistema Peña Blanca - ACTIVO');
                console.log('🔗 URL: http://localhost:5000');
                console.log('💾 Base de datos: SQLite local');
                console.log('✅ Funcionando completamente offline');
                console.log('\n--- Para cerrar presiona Ctrl+C ---');
            }, 2000);
        }
    });
    
    server.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
    });
    
    server.on('close', (code) => {
        console.log(`\n🔴 Sistema cerrado con código: ${code}`);
        process.exit(code);
    });
    
    // Manejar Ctrl+C
    process.on('SIGINT', () => {
        console.log('\n🔴 Cerrando Sistema de Lavado Peña Blanca...');
        server.kill();
        process.exit(0);
    });
}