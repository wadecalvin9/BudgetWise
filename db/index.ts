import { initCategories } from '@/services/categoryService';
import { type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 4;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const currentVersion = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = currentVersion?.user_version ?? 0;

  if (version >= DATABASE_VERSION) {
    return;
  }

  if (version === 0) {
    await db.execAsync(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                date INTEGER NOT NULL,
                type TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                icon TEXT,
                color TEXT,
                type TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS budgets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL UNIQUE,
                amount REAL NOT NULL,
                period TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS recurring_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                type TEXT NOT NULL,
                frequency TEXT NOT NULL,
                next_date INTEGER NOT NULL,
                active INTEGER DEFAULT 1
            );
        `);
    await initCategories(db);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
