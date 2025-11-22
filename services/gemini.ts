import { GoogleGenerativeAI } from '@google/generative-ai';
import { Transaction } from './transactionService';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function getFinancialInsights(transactions: Transaction[]) {
    if (!genAI) {
        return "Gemini API Key is missing. Please check your .env file.";
    }

    if (transactions.length === 0) {
        return "No transactions found. Add some expenses to get insights!";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const transactionSummary = transactions.map(t =>
        `- ${t.date}: ${t.type} of $${t.amount} for ${t.category} (${t.description})`
    ).join('\n');

    const prompt = `
    Analyze the following financial transactions and provide 3 concise, actionable insights or tips to improve financial health.
    Focus on spending patterns and potential savings.
    
    Transactions:
    ${transactionSummary}
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Failed to generate insights. Please try again later.";
    }
}

export async function suggestCategory(description: string) {
    if (!genAI) return null;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Suggest a single short category name (e.g., Food, Transport, Utilities) for a transaction described as: "${description}". Return only the category name.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return null;
    }
}
