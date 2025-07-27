import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../shared/schema';
import path from 'path';
// Solo importar app de electron si estamos en modo electron
const getElectronApp = () => {
  try {
    if (process.env.ELECTRON_MODE === 'true') {
      return require('electron').app;
    }
  } catch (e) {
    // Electron no está disponible, continuar sin él
  }
  return null;
};

// Configurar la base de datos SQLite para aplicación portable
let dbPath: string;

if (process.env.ELECTRON_MODE === 'true') {
  // En modo Electron, usar directorio de datos de usuario
  const app = getElectronApp();
  const userDataPath = app?.getPath('userData') || './data';
  dbPath = path.join(userDataPath, 'carwash.db');
} else {
  // En modo desarrollo/web, usar directorio local
  dbPath = './carwash.db';
}

console.log(`🗃️ Base de datos SQLite: ${dbPath}`);

// Crear conexión SQLite
const sqlite = new Database(dbPath);

// Habilitar WAL mode para mejor rendimiento
sqlite.pragma('journal_mode = WAL');

// Crear instancia de Drizzle
export const db = drizzle(sqlite, { schema });

// Función para inicializar la base de datos
export async function initializeDatabase() {
  try {
    console.log('🔧 Inicializando base de datos SQLite...');
    
    // Ejecutar las migraciones/creación de tablas aquí
    // Por ahora, vamos a crear las tablas manualmente
    
    // Crear tabla de servicios
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        duration INTEGER DEFAULT 60,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla de citas
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        customer_email TEXT,
        service_id TEXT NOT NULL,
        date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        status TEXT DEFAULT 'scheduled',
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services (id)
      )
    `);
    
    // Crear tabla de inventario
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 5,
        supplier TEXT,
        image_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla de facturas
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        customer_email TEXT,
        customer_rtn TEXT,
        items TEXT NOT NULL, -- JSON string
        subtotal REAL NOT NULL,
        tax REAL NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'paid',
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla de clientes CRM
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        rtn TEXT,
        total_spent REAL DEFAULT 0,
        visit_count INTEGER DEFAULT 0,
        last_visit TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla de promociones
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS promotions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        discount_percentage REAL NOT NULL,
        valid_from TEXT NOT NULL,
        valid_until TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insertar datos de ejemplo si no existen
    const servicesCount = sqlite.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
    
    if (servicesCount.count === 0) {
      console.log('📝 Insertando datos de ejemplo...');
      
      // Insertar servicios
      const insertService = sqlite.prepare(`
        INSERT INTO services (id, name, price) VALUES (?, ?, ?)
      `);
      
      insertService.run('lavado-basico', 'Lavado Básico', 80);
      insertService.run('lavado-completo', 'Lavado Completo', 150);
      insertService.run('lavado-premium', 'Lavado Premium', 250);
      insertService.run('encerado', 'Encerado', 200);
      insertService.run('detallado', 'Detallado Completo', 400);
      
      // Insertar productos de inventario
      const insertProduct = sqlite.prepare(`
        INSERT INTO inventory (id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)
      `);
      
      insertProduct.run('shampoo-auto', 'Champú para Auto', 'Champú especializado para vehículos', 45, 20);
      insertProduct.run('cera-premium', 'Cera Premium', 'Cera de alta calidad para protección', 85, 15);
      insertProduct.run('limpiador-interior', 'Limpiador de Interior', 'Limpiador para tapicería y plásticos', 35, 25);
      insertProduct.run('aromatizante', 'Aromatizante', 'Aromatizante de larga duración', 25, 30);
      insertProduct.run('aspirado-profundo', 'Aspirado Profundo', 'Servicio de aspirado detallado', 40, 100);
    }
    
    console.log('✅ Base de datos SQLite inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  }
}

export { sqlite };