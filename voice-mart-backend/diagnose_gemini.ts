import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.error('❌ No API key found!');
  process.exit(1);
}

console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');

const genAI = new GoogleGenerativeAI(apiKey);

// Test different model names
const modelsToTest = [
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-pro',
  'gemini-1.0-pro',
  'gemini-1.0-pro-latest',
  'models/gemini-pro',
  'models/gemini-1.5-flash',
];

async function testModels() {
  console.log('\n🧪 Testing Gemini Models...\n');

  for (const modelName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "OK"');
      const response = await result.response;
      const text = response.text();
      console.log(`✅ ${modelName}: WORKS! Response: ${text.substring(0, 20)}`);
    } catch (error: any) {
      if (error.message.includes('404')) {
        console.log(`❌ ${modelName}: NOT FOUND (404)`);
      } else if (error.message.includes('429')) {
        console.log(`⚠️ ${modelName}: RATE LIMITED (but exists!)`);
      } else {
        console.log(`⚠️ ${modelName}: ${error.message.substring(0, 50)}`);
      }
    }
  }
}

testModels();
