import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";
import path from 'path';
import fs from 'fs';

// Para aplicación portable: usar SQLite
const isElectron = process.env.ELECTRON_MODE === 'true';
const dbPath = isElectron 
  ? process.env.DATABASE_URL?.replace('file:', '') || 'carwash.db'
  : path.join(process.cwd(), 'carwash.db');

// Asegurar que el directorio existe
if (isElectron) {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

export const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });