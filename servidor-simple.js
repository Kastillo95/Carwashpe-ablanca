// Servidor alternativo simple para Sistema Peña Blanca
const express = require('express');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando servidor simple...');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para logs
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  next();
});

// Servir archivos estáticos
app.use(express.static('client'));
app.use(express.static('client/dist'));
app.use(express.static('client/public'));

// API básica para testing
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
});

// Datos de prueba para dashboard
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    todayAppointments: 5,
    dailyRevenue: 1500.00,
    lowStockItems: 2,
    servedCustomers: 8
  });
});

// Ruta catch-all para SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Si no existe index.html, crear una página básica
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sistema Peña Blanca - Servidor Activo</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f0f0; }
          .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .success { color: #28a745; font-size: 24px; margin-bottom: 20px; }
          .info { color: #666; margin: 10px 0; }
          .button { background: #0079F2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚗 Sistema de Lavado Peña Blanca</h1>
          <div class="success">✅ Servidor Funcionando Correctamente</div>
          <div class="info">Puerto: ${PORT}</div>
          <div class="info">Hora: ${new Date().toLocaleString('es-ES')}</div>
          <div class="info">Estado: Activo y Listo</div>
          
          <h3>🔧 Próximos Pasos:</h3>
          <p>El servidor está funcionando. Ahora necesitas compilar el frontend:</p>
          <ol style="text-align: left; display: inline-block;">
            <li>Abrir nueva terminal</li>
            <li>Ejecutar: <code>npm run build</code></li>
            <li>Recargar esta página</li>
          </ol>
          
          <div>
            <a href="/api/test" class="button">🧪 Test API</a>
            <a href="/api/dashboard/stats" class="button">📊 Test Dashboard</a>
          </div>
        </div>
        <script>
          // Auto-refresh cada 30 segundos para detectar cuando el frontend esté listo
          setTimeout(() => location.reload(), 30000);
        </script>
      </body>
      </html>
    `);
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🌐 Sistema de Lavado Peña Blanca - ACTIVO');
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📅 Iniciado: ${new Date().toLocaleString('es-ES')}`);
  console.log('✅ Servidor funcionando correctamente');
  console.log('');
  console.log('--- Para cerrar presiona Ctrl+C ---');
});

// Manejo de errores
process.on('uncaughtException', (err) => {
  console.error('🔴 Error del servidor:', err.message);
});

process.on('SIGINT', () => {
  console.log('\n🔴 Cerrando servidor...');
  process.exit(0);
});