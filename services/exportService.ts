import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { type SQLiteDatabase } from 'expo-sqlite';

import { getBudgetProgress } from './budgetService';
import { getTransactions, Transaction } from './transactionService';

export interface ExportOptions {
    format: 'csv' | 'pdf';
    dateRange: 'month' | '3months' | 'year' | 'all' | 'custom';
    startDate?: number;
    endDate?: number;
    includeBudgets?: boolean;
}

// Generate CSV from transactions
export async function exportToCSV(db: SQLiteDatabase, options: ExportOptions): Promise<string> {
    const transactions = await getFilteredTransactions(db, options);

    // CSV Header
    let csv = 'Date,Type,Category,Amount,Description\n';

    // CSV Rows
    transactions.forEach(t => {
        const date = new Date(t.date).toLocaleDateString();
        const amount = t.amount.toFixed(2);
        const description = (t.description || '').replace(/,/g, ';'); // Escape commas
        csv += `${date},${t.type},${t.category},${amount},"${description}"\n`;
    });

    // Add budget data if requested
    if (options.includeBudgets) {
        const budgets = await getBudgetProgress(db);
        csv += '\n\nBudget Summary\n';
        csv += 'Category,Limit,Spent,Remaining\n';
        budgets.forEach(b => {
            csv += `${b.category},${b.limit.toFixed(2)},${b.spent.toFixed(2)},${b.remaining.toFixed(2)}\n`;
        });
    }

    return csv;
}

// Generate simple text-based PDF (HTML-like format)
export async function exportToPDF(db: SQLiteDatabase, options: ExportOptions, currencySymbol: string): Promise<string> {
    const transactions = await getFilteredTransactions(db, options);

    // Calculate summary
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // Simple text-based report
    let report = '='.repeat(50) + '\n';
    report += '        FINANCIAL REPORT\n';
    report += '='.repeat(50) + '\n\n';

    report += `Period: ${getDateRangeLabel(options)}\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;

    report += '-'.repeat(50) + '\n';
    report += 'SUMMARY\n';
    report += '-'.repeat(50) + '\n';
    report += `Total Income:   ${currencySymbol}${totalIncome.toFixed(2)}\n`;
    report += `Total Expense:  ${currencySymbol}${totalExpense.toFixed(2)}\n`;
    report += `Balance:        ${currencySymbol}${balance.toFixed(2)}\n\n`;

    // Transactions
    report += '-'.repeat(50) + '\n';
    report += 'TRANSACTIONS\n';
    report += '-'.repeat(50) + '\n\n';

    transactions.forEach(t => {
        const date = new Date(t.date).toLocaleDateString();
        const sign = t.type === 'income' ? '+' : '-';
        report += `${date} | ${t.category}\n`;
        report += `  ${sign}${currencySymbol}${t.amount.toFixed(2)}`;
        if (t.description) {
            report += ` - ${t.description}`;
        }
        report += '\n\n';
    });

    // Budget summary
    if (options.includeBudgets) {
        const budgets = await getBudgetProgress(db);
        report += '-'.repeat(50) + '\n';
        report += 'BUDGET SUMMARY\n';
        report += '-'.repeat(50) + '\n\n';

        budgets.forEach(b => {
            const percentage = ((b.spent / b.limit) * 100).toFixed(0);
            report += `${b.category}\n`;
            report += `  Budget: ${currencySymbol}${b.limit.toFixed(2)}\n`;
            report += `  Spent:  ${currencySymbol}${b.spent.toFixed(2)} (${percentage}%)\n`;
            report += `  Left:   ${currencySymbol}${b.remaining.toFixed(2)}\n\n`;
        });
    }

    report += '='.repeat(50) + '\n';
    report += 'End of Report\n';
    report += '='.repeat(50) + '\n';

    return report;
}

// Save and share file
export async function saveAndShareFile(content: string, filename: string): Promise<void> {
<<<<<<< HEAD
    // Use the new FileSystem API with Paths
    const directory = FileSystem.Paths.document;
=======
    // Use cache directory for temporary export files
    const directory = FileSystem.Paths.cache;
>>>>>>> 0f282162e89573e64e1a5d71bc8d5c09fd540972
    const file = new FileSystem.File(directory, filename);

    // Write file using new API
    await file.write(content);

    // Share file
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
        await Sharing.shareAsync(file.uri, {
<<<<<<< HEAD
            mimeType: filename.endsWith('.csv') ? 'text/csv' : 'text/plain',
            dialogTitle: 'Export Financial Data',
            UTI: filename.endsWith('.csv') ? 'public.comma-separated-values-text' : 'public.plain-text',
=======
            mimeType: filename.endsWith('.csv') ? 'text/csv' : 'application/pdf',
            dialogTitle: 'Export Financial Data',
>>>>>>> 0f282162e89573e64e1a5d71bc8d5c09fd540972
        });
    } else {
        throw new Error('Sharing is not available on this device');
    }
}

// Helper: Get filtered transactions based on date range
async function getFilteredTransactions(db: SQLiteDatabase, options: ExportOptions): Promise<Transaction[]> {
    const allTransactions = await getTransactions(db);

    let startDate: number;
    let endDate: number = Date.now();

    const now = new Date();

    switch (options.dateRange) {
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            break;
        case '3months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1).getTime();
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1).getTime();
            break;
        case 'custom':
            startDate = options.startDate || 0;
            endDate = options.endDate || Date.now();
            break;
        case 'all':
        default:
            startDate = 0;
            break;
    }

    return allTransactions.filter(t => t.date >= startDate && t.date <= endDate);
}

// Helper: Get date range label
function getDateRangeLabel(options: ExportOptions): string {
    switch (options.dateRange) {
        case 'month':
            return 'This Month';
        case '3months':
            return 'Last 3 Months';
        case 'year':
            return 'This Year';
        case 'custom':
            if (options.startDate && options.endDate) {
                return `${new Date(options.startDate).toLocaleDateString()} - ${new Date(options.endDate).toLocaleDateString()}`;
            }
            return 'Custom Range';
        case 'all':
        default:
            return 'All Time';
    }
}
