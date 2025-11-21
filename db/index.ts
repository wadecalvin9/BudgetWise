import { type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 4;

let isMigrating = false;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  if (isMigrating) {
    console.log('Migration already in progress, skipping...');
    return;
  }
  isMigrating = true;
  console.log('Database migration started');
  try {
    const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const currentVersion = result?.user_version ?? 0;
    console.log('Current DB version:', currentVersion);

    if (currentVersion >= DATABASE_VERSION) {
      console.log('DB is up to date');
      return;
    }

    if (currentVersion === 0) {
      console.log('Creating tables...');
      await db.execAsync(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                date INTEGER NOT NULL,
                type TEXT NOT NULL
            );
        `);
      console.log('Created transactions table');

      await db.execAsync(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                icon TEXT,
                color TEXT,
                type TEXT NOT NULL
            );
        `);
      console.log('Created categories table');

      await db.execAsync(`
            CREATE TABLE IF NOT EXISTS budgets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL UNIQUE,
                amount REAL NOT NULL,
                period TEXT NOT NULL
            );
        `);
      console.log('Created budgets table');

      await db.execAsync(`
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
      console.log('Created recurring_transactions table');

      console.log('Initialized categories');
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    console.log('Migration completed, version set to', DATABASE_VERSION);
  } catch (error) {
    console.error('Migration error:', error);
    throw error; // Re-throw to see the crash if it happens
  } finally {
    isMigrating = false;
  }
}
