const express = require('express');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando Carwash Peña Blanca...');

// Crear servidor Express
const app = express();
const port = 3000;

// Servir archivos estáticos
const publicPath = path.join(__dirname, 'dist', 'public');
console.log('📁 Buscando archivos en:', publicPath);

if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  console.log('✅ Archivos estáticos configurados');
} else {
  console.log('⚠️ Carpeta dist/public no encontrada');
}

// Ruta principal
app.get('/', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Carwash Peña Blanca</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
          .container { max-width: 600px; margin: 0 auto; }
          .status { background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚗 Carwash Peña Blanca</h1>
          <div class="status">
            <h2>✅ Servidor funcionando correctamente</h2>
            <p>Tu aplicación está ejecutándose en: <strong>http://localhost:${port}</strong></p>
            <p>Si ves este mensaje, el sistema está operativo.</p>
          </div>
          <div style="text-align: left; background: #f5f5f5; padding: 15px; border-radius: 5px;">
            <h3>📋 Estado del sistema:</h3>
            <p>✅ Servidor Express: Activo</p>
            <p>✅ Puerto ${port}: Disponible</p>
            <p>📁 Archivos: ${fs.existsSync(publicPath) ? 'Encontrados' : 'No encontrados'}</p>
            <p>🕒 Iniciado: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

// APIs básicas para probar
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Carwash API funcionando',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    todayAppointments: "0",
    dailyRevenue: "0.00",
    monthlyRevenue: "0.00",
    totalCustomers: "0"
  });
});

// Iniciar servidor
app.listen(port, '127.0.0.1', () => {
  console.log(`✅ Carwash Peña Blanca iniciado exitosamente!`);
  console.log(`🌐 Abre tu navegador en: http://localhost:${port}`);
  console.log(`🔧 Para detener: Ctrl+C`);
  console.log('');
  
  // Intentar abrir automáticamente el navegador
  const { exec } = require('child_process');
  exec(`start http://localhost:${port}`, (error) => {
    if (error) {
      console.log('💡 Abre manualmente: http://localhost:3000');
    } else {
      console.log('🚀 Navegador abierto automáticamente');
    }
  });
});

// Manejar cierre limpio
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando Carwash Peña Blanca...');
  process.exit(0);
});