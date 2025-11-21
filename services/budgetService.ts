import { type SQLiteDatabase } from 'expo-sqlite';

export interface Budget {
    id?: number;
    category: string;
    amount: number;
    period: string;
}

export async function setBudget(db: SQLiteDatabase, budget: Budget) {
    // Upsert budget for category (trim whitespace)
    const category = budget.category.trim();
    const result = await db.runAsync(
        `INSERT INTO budgets (category, amount, period) VALUES (?, ?, ?)
     ON CONFLICT(category) DO UPDATE SET amount = excluded.amount`,
        category,
        budget.amount,
        budget.period
    );
    return result.lastInsertRowId;
}

export async function getBudgets(db: SQLiteDatabase) {
    return await db.getAllAsync<Budget>('SELECT * FROM budgets');
}

export interface BudgetProgress extends Budget {
    spent: number;
    remaining: number;
    percentage: number;
    limit: number; // Alias for amount for compatibility
}

export async function getBudgetProgress(db: SQLiteDatabase): Promise<BudgetProgress[]> {
    try {
        const budgets = await getBudgets(db);

        // Get current month start/end
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();

        // Get all expenses for current month
        const allExpenses = await db.getAllAsync<{ category: string, amount: number }>(
            `SELECT category, amount FROM transactions 
         WHERE type = 'expense' AND date >= ? AND date <= ?`,
            startOfMonth,
            endOfMonth
        );

        // Calculate totals per category (trim and lowercase)
        const expensesByCategory = allExpenses.reduce((acc, exp) => {
            const cat = exp.category.trim().toLowerCase();
            acc[cat] = (acc[cat] || 0) + exp.amount;
            return acc;
        }, {} as Record<string, number>);

        const progress = budgets.map(b => {
            const spent = expensesByCategory[b.category.trim().toLowerCase()] || 0;
            return {
                ...b,
                spent,
                remaining: b.amount - spent,
                percentage: Math.min((spent / b.amount) * 100, 100),
                limit: b.amount
            };
        });

        return progress;
    } catch (error) {
        console.error('Budget Error:', error);
        return [];
    }
}

export async function deleteBudget(db: SQLiteDatabase, category: string) {
    await db.runAsync('DELETE FROM budgets WHERE category = ?', category);
}
