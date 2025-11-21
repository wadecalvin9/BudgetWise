import { TransactionType } from '@/components/TransactionCard';
import { type SQLiteDatabase } from 'expo-sqlite';

export interface Transaction {
    id?: number;
    amount: number;
    category: string;
    description?: string;
    date: number; // timestamp
    type: TransactionType;
}

export async function addTransaction(db: SQLiteDatabase, transaction: Transaction) {
    const result = await db.runAsync(
        'INSERT INTO transactions (amount, category, description, date, type) VALUES (?, ?, ?, ?, ?)',
        transaction.amount,
        transaction.category,
        transaction.description || '',
        transaction.date,
        transaction.type
    );
    return result.lastInsertRowId;
}

export async function getTransactions(db: SQLiteDatabase) {
    return await db.getAllAsync<Transaction>('SELECT * FROM transactions ORDER BY date DESC');
}

export async function getRecentTransactions(db: SQLiteDatabase, limit: number = 5) {
    return await db.getAllAsync<Transaction>(`SELECT * FROM transactions ORDER BY date DESC LIMIT ?`, [limit]);
}
export async function deleteTransaction(db: SQLiteDatabase, id: number) {
    await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function updateTransaction(db: SQLiteDatabase, id: number, transaction: Partial<Omit<Transaction, 'id'>>) {
    const fields = Object.keys(transaction).map(key => `${key} = ?`).join(', ');
    const values = Object.values(transaction);
    await db.runAsync(`UPDATE transactions SET ${fields} WHERE id = ?`, [...values, id]);
}

export async function getTransactionsByDateRange(db: SQLiteDatabase, startDate: number, endDate: number) {
    return await db.getAllAsync<Transaction>(
        'SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC',
        [startDate, endDate]
    );
}
