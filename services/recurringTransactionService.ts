import { type SQLiteDatabase } from 'expo-sqlite';

export interface RecurringTransaction {
    id?: number;
    amount: number;
    category: string;
    description?: string;
    type: 'income' | 'expense';
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    next_date: number;
    active: boolean;
}

export async function addRecurringTransaction(db: SQLiteDatabase, transaction: RecurringTransaction) {
    const result = await db.runAsync(
        'INSERT INTO recurring_transactions (amount, category, description, type, frequency, next_date, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        transaction.amount,
        transaction.category,
        transaction.description || '',
        transaction.type,
        transaction.frequency,
        transaction.next_date,
        transaction.active ? 1 : 0
    );
    return result.lastInsertRowId;
}

export async function getRecurringTransactions(db: SQLiteDatabase) {
    return await db.getAllAsync<RecurringTransaction>('SELECT * FROM recurring_transactions ORDER BY next_date ASC');
}

export async function updateRecurringTransaction(db: SQLiteDatabase, id: number, transaction: Partial<RecurringTransaction>) {
    const fields = Object.keys(transaction).map(key => `${key} = ?`).join(', ');
    const values = Object.values(transaction);
    await db.runAsync(`UPDATE recurring_transactions SET ${fields} WHERE id = ?`, [...values, id]);
}

export async function deleteRecurringTransaction(db: SQLiteDatabase, id: number) {
    await db.runAsync('DELETE FROM recurring_transactions WHERE id = ?', [id]);
}

export async function processRecurringTransactions(db: SQLiteDatabase) {
    const now = Date.now();
    const recurring = await db.getAllAsync<RecurringTransaction>(
        'SELECT * FROM recurring_transactions WHERE active = 1 AND next_date <= ?',
        [now]
    );

    for (const rt of recurring) {
        // Create the transaction
        await db.runAsync(
            'INSERT INTO transactions (amount, category, description, date, type) VALUES (?, ?, ?, ?, ?)',
            rt.amount,
            rt.category,
            rt.description || '',
            now,
            rt.type
        );

        // Calculate next date
        let nextDate = rt.next_date;
        const date = new Date(nextDate);

        switch (rt.frequency) {
            case 'daily':
                date.setDate(date.getDate() + 1);
                break;
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() + 1);
                break;
        }

        nextDate = date.getTime();

        // Update next_date
        if (rt.id) {
            await db.runAsync(
                'UPDATE recurring_transactions SET next_date = ? WHERE id = ?',
                [nextDate, rt.id]
            );
        }
    }
}
