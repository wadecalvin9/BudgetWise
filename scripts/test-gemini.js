const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testModel() {
    const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    console.log("Testing with key starting:", key ? key.substring(0, 5) : "NONE");

    const genAI = new GoogleGenerativeAI(key);
    const modelName = "gemini-2.0-flash";

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`Testing ${modelName}...`);
        const result = await model.generateContent("Explain how AI works in a few words");
        console.log(`Success! Response:`, result.response.text());
    } catch (e) {
        console.log(`Failed:`, e.message);
    }
}

testModel();
