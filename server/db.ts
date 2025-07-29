// Configuración de base de datos local independiente
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../shared/schema';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener directorio actual para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar ruta de base de datos local
const dbPath = path.join(__dirname, '..', 'carwash-local.db');

console.log(`🗃️ Base de datos local: ${dbPath}`);

// Crear conexión SQLite local
const sqlite = new Database(dbPath);

// Habilitar WAL mode para mejor rendimiento
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('cache_size = 1000000');
sqlite.pragma('foreign_keys = ON');

// Crear instancia de Drizzle con SQLite
export const db = drizzle(sqlite, { schema });

// Exportar instancia de SQLite para uso directo si es necesario
export { sqlite };