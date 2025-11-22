// AI Service Configuration
// Supports multiple AI providers: Gemini, OpenAI, OpenRouter, etc.

interface AIConfig {
    provider: 'gemini' | 'openai' | 'openrouter' | 'anthropic';
    apiKey: string;
    model?: string;
    baseURL?: string;
}

// Load from environment variables
const AI_PROVIDER = (process.env.EXPO_PUBLIC_AI_PROVIDER || 'gemini') as AIConfig['provider'];
const AI_API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const AI_MODEL = process.env.EXPO_PUBLIC_AI_MODEL;
const AI_BASE_URL = process.env.EXPO_PUBLIC_AI_BASE_URL;

const config: AIConfig = {
    provider: AI_PROVIDER,
    apiKey: AI_API_KEY,
    model: AI_MODEL,
    baseURL: AI_BASE_URL,
};

// Generic AI request function
async function makeAIRequest(prompt: string): Promise<string> {
<<<<<<< HEAD
    // Validate API key
    if (!config.apiKey || config.apiKey.trim() === '') {
        throw new Error('AI API key not configured. Please set EXPO_PUBLIC_AI_API_KEY or EXPO_PUBLIC_GEMINI_API_KEY in your environment variables.');
    }

=======
>>>>>>> 0f282162e89573e64e1a5d71bc8d5c09fd540972
    switch (config.provider) {
        case 'gemini':
            return makeGeminiRequest(prompt);
        case 'openai':
            return makeOpenAIRequest(prompt);
        case 'openrouter':
            return makeOpenRouterRequest(prompt);
        case 'anthropic':
            return makeAnthropicRequest(prompt);
        default:
            throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
}

// Gemini implementation
async function makeGeminiRequest(prompt: string): Promise<string> {
<<<<<<< HEAD
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(config.apiKey);
        const model = genAI.getGenerativeModel({ model: config.model || 'gemini-2.0-flash-exp' });

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        throw new Error(`Gemini API request failed: ${error.message || 'Unknown error'}`);
    }
=======
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({ model: config.model || 'gemini-2.0-flash-exp' });

    const result = await model.generateContent(prompt);
    return result.response.text();
>>>>>>> 0f282162e89573e64e1a5d71bc8d5c09fd540972
}

// OpenAI implementation
async function makeOpenAIRequest(prompt: string): Promise<string> {
<<<<<<< HEAD
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model || 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from OpenAI API');
        }

        return data.choices[0].message.content;
    } catch (error: any) {
        console.error('OpenAI API Error:', error);
        throw new Error(`OpenAI API request failed: ${error.message || 'Unknown error'}`);
    }
=======
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
            model: config.model || 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
>>>>>>> 0f282162e89573e64e1a5d71bc8d5c09fd540972
}

// OpenRouter implementation
async function makeOpenRouterRequest(prompt: string): Promise<string> {
<<<<<<< HEAD
    try {
        const response = await fetch(config.baseURL || 'https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                'HTTP-Referer': 'https://budget-tracker.app',
            },
            body: JSON.stringify({
                model: config.model || 'openai/gpt-4',
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from OpenRouter API');
        }

        return data.choices[0].message.content;
    } catch (error: any) {
        console.error('OpenRouter API Error:', error);
        throw new Error(`OpenRouter API request failed: ${error.message || 'Unknown error'}`);
    }
=======
    const response = await fetch(config.baseURL || 'https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
            'HTTP-Referer': 'https://budget-tracker.app',
        },
        body: JSON.stringify({
            model: config.model || 'openai/gpt-4',
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
>>>>>>> 0f282162e89573e64e1a5d71bc8d5c09fd540972
}

// Anthropic implementation
async function makeAnthropicRequest(prompt: string): Promise<string> {
<<<<<<< HEAD
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: config.model || 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        if (!data.content || !data.content[0] || !data.content[0].text) {
            throw new Error('Invalid response format from Anthropic API');
        }

        return data.content[0].text;
    } catch (error: any) {
        console.error('Anthropic API Error:', error);
        throw new Error(`Anthropic API request failed: ${error.message || 'Unknown error'}`);
    }
=======
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: config.model || 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    const data = await response.json();
    return data.content[0].text;
>>>>>>> 0f282162e89573e64e1a5d71bc8d5c09fd540972
}

// Public API functions
export async function getFinancialInsights(transactions: any[], currencySymbol: string = '$'): Promise<string> {
    const prompt = `Analyze these financial transactions and provide insights. The currency is "${currencySymbol}".
${JSON.stringify(transactions, null, 2)}

Provide:
1. Spending patterns (use ${currencySymbol} for amounts)
2. Budget recommendations
3. Savings opportunities
4. Financial health score

Format as markdown.`;

    return makeAIRequest(prompt);
}

export async function suggestCategory(description: string): Promise<string> {
    const prompt = `Suggest a category for this transaction: "${description}"
  
Common categories: Food, Rent, Transport, Salary, Freelance, Shopping, Entertainment, Health, Education, Other

Return only the category name, nothing else.`;

    return makeAIRequest(prompt);
}

export async function analyzeBudget(budgets: any[], transactions: any[]): Promise<string> {
    const prompt = `Analyze budget vs actual spending:
Budgets: ${JSON.stringify(budgets, null, 2)}
Transactions: ${JSON.stringify(transactions, null, 2)}

Provide:
1. Budget adherence score
2. Categories over/under budget
3. Recommendations
4. Alerts

Format as markdown.`;

    return makeAIRequest(prompt);
}
