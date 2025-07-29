// Inicialización automática del sistema
import { db } from "./db";
import { services, inventory, customers } from "../shared/schema";
import { eq } from "drizzle-orm";

export async function initializeSystem() {
  try {
    console.log('🔧 Inicializando Sistema de Lavado Peña Blanca...');
    
    // Verificar si ya existen datos
    const existingServices = await db.select().from(services);
    
    if (existingServices.length === 0) {
      console.log('📝 Configurando datos iniciales del sistema...');
      
      // Insertar servicios por defecto
      await db.insert(services).values([
        {
          name: 'Lavado Básico',
          description: 'Lavado exterior del vehículo con jabón y secado',
          price: '80.00',
          duration: 30,
          active: true
        },
        {
          name: 'Lavado Completo',
          description: 'Lavado exterior e interior, incluye aspirado y limpieza de vidrios',
          price: '150.00',
          duration: 45,
          active: true
        },
        {
          name: 'Lavado Premium',
          description: 'Servicio completo con encerado, aromatizante y detallado',
          price: '250.00',
          duration: 60,
          active: true
        },
        {
          name: 'Solo Aspirado',
          description: 'Aspirado completo del interior del vehículo',
          price: '40.00',
          duration: 15,
          active: true
        },
        {
          name: 'Encerado',
          description: 'Aplicación de cera protectora para la pintura',
          price: '120.00',
          duration: 30,
          active: true
        },
        {
          name: 'Lavado de Motor',
          description: 'Limpieza y desengrase del compartimento del motor',
          price: '100.00',
          duration: 25,
          active: true
        }
      ]);

      // Insertar productos de inventario
      await db.insert(inventory).values([
        {
          name: 'Champú para Auto Premium',
          description: 'Champú concentrado especializado para vehículos',
          price: '45.00',
          quantity: 20,
          minQuantity: 5,
          category: 'Productos de Limpieza',
          isService: false,
          active: true
        },
        {
          name: 'Cera Líquida Turtle Wax',
          description: 'Cera líquida de alta calidad para protección duradera',
          price: '85.00',
          quantity: 15,
          minQuantity: 3,
          category: 'Productos de Acabado',
          isService: false,
          active: true
        },
        {
          name: 'Limpiador de Llantas',
          description: 'Desengrasante especializado para llantas de aleación',
          price: '35.00',
          quantity: 25,
          minQuantity: 5,
          category: 'Productos Especializados',
          isService: false,
          active: true
        },
        {
          name: 'Aromatizante Vainilla',
          description: 'Aromatizante duradero con fragancia a vainilla',
          price: '25.00',
          quantity: 30,
          minQuantity: 10,
          category: 'Aromatizantes',
          isService: false,
          active: true
        },
        {
          name: 'Aromatizante Coco',
          description: 'Aromatizante tropical con fragancia a coco',
          price: '25.00',
          quantity: 30,
          minQuantity: 10,
          category: 'Aromatizantes',
          isService: false,
          active: true
        },
        {
          name: 'Toallas de Microfibra',
          description: 'Paquete de 5 toallas premium para secado sin rayones',
          price: '60.00',
          quantity: 50,
          minQuantity: 10,
          category: 'Herramientas',
          isService: false,
          active: true
        },
        {
          name: 'Limpiador de Interior',
          description: 'Limpiador multiusos para tablero, asientos y plásticos',
          price: '40.00',
          quantity: 20,
          minQuantity: 5,
          category: 'Productos de Limpieza',
          isService: false,
          active: true
        },
        {
          name: 'Desengrasante de Motor',
          description: 'Desengrasante potente para limpieza de motor',
          price: '55.00',
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