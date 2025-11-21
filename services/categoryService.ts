import { type SQLiteDatabase } from 'expo-sqlite';

export interface Category {
    id?: number;
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
}

export async function initCategories(db: SQLiteDatabase) {
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      icon TEXT,
      color TEXT
    );
  `);

    // Seed default categories if empty
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
    if (result && result.count === 0) {
        const defaults = [
            { name: 'Food', type: 'expense', icon: 'cart', color: '#FF6384' },
            { name: 'Rent', type: 'expense', icon: 'home', color: '#36A2EB' },
            { name: 'Transport', type: 'expense', icon: 'car', color: '#FFCE56' },
            { name: 'Salary', type: 'income', icon: 'cash', color: '#4BC0C0' },
            { name: 'Freelance', type: 'income', icon: 'briefcase', color: '#9966FF' },
        ];

        for (const cat of defaults) {
            await db.runAsync(
                'INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)',
                cat.name, cat.type, cat.icon, cat.color
            );
        }
    }
}

export async function getCategories(db: SQLiteDatabase) {
    return await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name ASC');
}

export async function addCategory(db: SQLiteDatabase, category: Category) {
    const result = await db.runAsync(
        'INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)',
        category.name, category.type, category.icon || null, category.color || null
    );
    return result.lastInsertRowId;
}

export async function deleteCategory(db: SQLiteDatabase, id: number) {
    await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
}
