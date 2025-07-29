// Inicialización automática del sistema
import { db, sqlite } from "./db";
import { services, inventory, customers } from "../shared/schema";
import { eq } from "drizzle-orm";

export async function initializeSystem() {
  try {
    console.log('🔧 Inicializando Sistema de Lavado Peña Blanca...');
    
    // Crear tablas si no existen
    await createTables();
    
    // Verificar si ya existen datos
    const existingServices = await db.select().from(services);
    
    if (existingServices.length === 0) {
      console.log('📝 Configurando datos iniciales del sistema...');
      
      // Insertar servicios por defecto
      await db.insert(services).values([
        {
          name: 'Lavado Básico',
          description: 'Lavado exterior del vehículo con jabón y secado',
          price: 80.00,
          duration: 30,
          active: true
        },
        {
          name: 'Lavado Completo',
          description: 'Lavado exterior e interior, incluye aspirado y limpieza de vidrios',
          price: 150.00,
          duration: 45,
          active: true
        },
        {
          name: 'Lavado Premium',
          description: 'Servicio completo con encerado, aromatizante y detallado',
          price: 250.00,
          duration: 60,
          active: true
        },
        {
          name: 'Solo Aspirado',
          description: 'Aspirado completo del interior del vehículo',
          price: 40.00,
          duration: 15,
          active: true
        },
        {
          name: 'Encerado',
          description: 'Aplicación de cera protectora para la pintura',
          price: 120.00,
          duration: 30,
          active: true
        },
        {
          name: 'Lavado de Motor',
          description: 'Limpieza y desengrase del compartimento del motor',
          price: 100.00,
          duration: 25,
          active: true
        }
      ]);

      // Insertar productos de inventario
      await db.insert(inventory).values([
        {
          name: 'Champú para Auto Premium',
          description: 'Champú concentrado especializado para vehículos',
          price: 45.00,
          quantity: 20,
          minQuantity: 5,
          category: 'Productos de Limpieza',
          isService: false,
          active: true
        },
        {
          name: 'Cera Líquida Turtle Wax',
          description: 'Cera líquida de alta calidad para protección duradera',
          price: 85.00,
          quantity: 15,
          minQuantity: 3,
          category: 'Productos de Acabado',
          isService: false,
          active: true
        },
        {
          name: 'Limpiador de Llantas',
          description: 'Desengrasante especializado para llantas de aleación',
          price: 35.00,
          quantity: 25,
          minQuantity: 5,
          category: 'Productos Especializados',
          isService: false,
          active: true
        },
        {
          name: 'Aromatizante Vainilla',
          description: 'Aromatizante duradero con fragancia a vainilla',
          price: 25.00,
          quantity: 30,
          minQuantity: 10,
          category: 'Aromatizantes',
          isService: false,
          active: true
        },
        {
          name: 'Aromatizante Coco',
          description: 'Aromatizante tropical con fragancia a coco',
          price: 25.00,
          quantity: 30,
          minQuantity: 10,
          category: 'Aromatizantes',
          isService: false,
          active: true
        },
        {
          name: 'Toallas de Microfibra',
          description: 'Paquete de 5 toallas premium para secado sin rayones',
          price: 60.00,
          quantity: 50,
          minQuantity: 10,
          category: 'Herramientas',
          isService: false,
          active: true
        },
        {
          name: 'Limpiador de Interior',
          description: 'Limpiador multiusos para tablero, asientos y plásticos',
          price: 40.00,
          quantity: 20,
          minQuantity: 5,
          category: 'Productos de Limpieza',
          isService: false,
          active: true
        },
        {
          name: 'Desengrasante de Motor',
          description: 'Desengrasante potente para limpieza de motor',
          price: 55.00,
          quantity: 12,
          minQuantity: 3,
          category: 'Productos Especializados',
          isService: false,
          active: true
        }
      ]);

      console.log('✅ Datos iniciales configurados correctamente');
      console.log('🎯 Sistema listo para usar');
    } else {
      console.log('✅ Sistema ya inicializado previamente');
    }

    console.log('🌐 Sistema de Lavado Peña Blanca - ACTIVO');
    console.log('📊 Base de datos conectada y funcionando');
    console.log('🔗 Acceso web: http://localhost:5000');
    
  } catch (error) {
    console.error('❌ Error inicializando sistema:', error);
    throw error;
  }
}

async function createTables() {
  try {
    console.log('🔨 Creando tablas de base de datos...');
    
    // Crear tabla services
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        duration INTEGER NOT NULL,
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Crear tabla customers
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        tax_id TEXT,
        address TEXT,
        notes TEXT,
        total_spent REAL DEFAULT 0.00,
        last_visit TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        active INTEGER DEFAULT 1
      )
    `);

    // Crear tabla appointments
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER REFERENCES customers(id),
        service_id INTEGER REFERENCES services(id),
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        service_name TEXT NOT NULL,
        service_price REAL NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT DEFAULT 'scheduled',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Crear tabla inventory
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        barcode TEXT UNIQUE,
        quantity INTEGER DEFAULT 0,
        min_quantity INTEGER,
        price REAL NOT NULL,
        supplier TEXT,
        category TEXT,
        image_url TEXT,
        is_service INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Crear tabla invoices
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number TEXT NOT NULL UNIQUE,
        customer_id INTEGER REFERENCES customers(id),
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        customer_tax_id TEXT,
        subtotal REAL NOT NULL,
        tax REAL NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        date TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Crear tabla invoice_items
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER REFERENCES invoices(id),
        service_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total REAL NOT NULL
      )
    `);

    // Crear tabla promotions
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS promotions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        discount TEXT,
        valid_from TEXT NOT NULL,
        valid_until TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Crear tabla promotion_sends
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS promotion_sends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        promotion_id INTEGER REFERENCES promotions(id),
        customer_id INTEGER REFERENCES customers(id),
        sent_at TEXT DEFAULT (datetime('now')),
        status TEXT DEFAULT 'sent'
      )
    `);

    console.log('✅ Tablas de base de datos creadas correctamente');
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
    throw error;
  }
}