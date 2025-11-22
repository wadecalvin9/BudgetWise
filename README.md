# BudgetWise

A smart budget tracking app with AI-powered financial insights built with React Native and Expo.

## Features

- 💰 Track income and expenses
- 📊 Budget management with alerts
- 🤖 AI-powered financial insights
- 📱 Cross-platform (iOS, Android, Web)
- 🎨 Beautiful, modern UI with dark mode
- 💾 Local SQLite database

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure AI (Optional but recommended):**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your AI API key:
   ```env
   EXPO_PUBLIC_AI_PROVIDER=gemini
   EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   ```
   
   **Get a free Gemini API key:** https://aistudio.google.com/apikey

3. **Start the development server:**
   ```bash
   npx expo start
   ```

## AI Configuration

The app supports multiple AI providers:

- **Gemini** (recommended, free tier available)
- **OpenAI** (requires paid API key)
- **OpenRouter** (pay-as-you-go)
- **Anthropic Claude** (requires API key)

See `.env.example` for configuration examples.

### Without AI Configuration

The app works perfectly fine without AI configuration! You'll still have:
- ✅ Full budget tracking
- ✅ Transaction management
- ✅ Budget alerts
- ✅ Beautiful charts and statistics

The AI Insights feature will show a helpful message if you try to use it without an API key configured.

## Troubleshooting

### "Cannot convert undefined value to object" Error

This error occurred when the AI service was called without proper API key configuration. **This has been fixed!** The app now:
- Validates API keys before making requests
- Shows clear error messages if keys are missing
- Gracefully handles API failures

If you see this error, make sure you've configured your `.env` file with a valid API key (see Setup step 2 above).

## Tech Stack

- React Native / Expo
- TypeScript
- SQLite (expo-sqlite)
- Multiple AI providers support
- React Native Markdown Display