import ollama from 'ollama';
import logger from '../utils/logger.js';
import { VoiceCommandResult } from './geminiService.js'; // Reuse interface

export class OllamaService {
    private model: string;

    constructor(model: string = 'mistral') {
        this.model = model;
    }

    /**
     * Process text command using local Ollama model
     */
    /**
     * Process text command using local Ollama model
     * @param text The user's spoken text
     * @param languageHint Optional language code hint (e.g., 'kn-IN') to guide the model
     */
    async processTextCommand(text: string, languageHint?: string): Promise<VoiceCommandResult> {
        try {
            logger.info(`Ollama Processing: "${text}" (Model: ${this.model}, Hint: ${languageHint})`);

            const prompt = `You are a highly intelligent, multilingual voice assistant for "Voice Mart", an advanced e-commerce platform.
Your goal is to understand the user's intent and return a structured JSON response.

**CURRENT CONTEXT:**
- **User's Language Context:** The user has selected "${languageHint || 'Auto-detect'}" in the app.
- **Input Text:** "${text}"
- **Platform Features:** Search, Cart, Wishlist, Orders, Checkout, Navigation, Theme (Dark/Light).

**INSTRUCTIONS:**
1. **Analyze the Input:** Understand what the user wants to do.
2. **Extract Details:** Identify the 'action' and the specific 'item'.
3. **Formulate Response:** Create a natural, friendly response **IN THE SAME LANGUAGE** as the input text.
    - If input is Kannada (or mixed with English like "Cart open maadi") -> Reply in Kannada.
    - If input is Hindi -> Reply in Hindi.
    - If input is English -> Reply in English.

**VALID ACTIONS:**
- **search**: User wants to find products. Item = search query.
- **add_to_cart**: User wants to add item. Item = product name.
- **remove_from_cart**: User wants to remove item. Item = product name.
- **add_to_wishlist**: User wants to save item. Item = product name.
- **navigate**: User wants to go to a page (cart, home, orders, wishlist, profile).
- **checkout**: User wants to buy/pay.
- **set_theme**: User wants to change look (dark/light).
- **unknown**: Intent is unclear.

**JSON FORMAT (STRICT):**
{
  "action": "one_of_valid_actions",
  "item": "extracted_item_or_query",
  "responseText": "Friendly response in the USER'S LANGUAGE",
  "language": "detected_language_code (en-IN, hi-IN, kn-IN, etc.)"
}

**EXAMPLES:**
- Input: "Show me laptops" -> {"action":"search", "item":"laptops", "responseText":"Searching for laptops.", "language":"en-IN"}
- Input: "कार्ट खोलो" -> {"action":"navigate", "item":"cart", "responseText":"कार्ट खोल रहे हैं।", "language":"hi-IN"}
- Input: "ನನ್ನ ಆರ್ಡರ್‌ಗಳನ್ನು ತೋರಿಸಿ" -> {"action":"navigate", "item":"orders", "responseText":"ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇವೆ.", "language":"kn-IN"}
- Input: "Dark mode enable maadi" -> {"action":"set_theme", "item":"dark", "responseText":"ಡಾರ್ಕ್ ಮೋಡ್‌ಗೆ ಬದಲಾಯಿಸುತ್ತಿದ್ದೇವೆ.", "language":"kn-IN"}

**USER INPUT:** "${text}"

**RESPONSE (JSON ONLY):**`;

            const response = await ollama.chat({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                format: 'json', // Enforce JSON mode
                stream: false,
            });

            const content = response.message.content;
            logger.info(`Ollama Response: ${content}`);

            const parsed = JSON.parse(content);

            return {
                success: true,
                transcript: text,
                action: parsed.action || 'unknown',
                item: parsed.item || '',
                responseText: parsed.responseText || "I didn't understand that.",
                language: 'auto', // Ollama handles language
                timestamp: new Date().toISOString()
            };

        } catch (error: any) {
            logger.error('Ollama Error:', error);
            
            // Fallback if model not found or other error
            if (error.message.includes('not found')) {
                logger.warn(`Model '${this.model}' not found. Please run: ollama pull ${this.model}`);
            }
            
            // Import regex fallback locally to avoid circular dependency if possible, 
            // or just return error structure
             return {
                success: false,
                transcript: text,
                action: 'unknown',
                item: '',
                error: `Ollama Error: ${error.message}`,
                timestamp: new Date().toISOString()
            };
        }
    }
}

export const ollamaService = new OllamaService();
// Export a standalone function to match the controller's expected interface
export const processTextCommand = (text: string, languageHint?: string) => ollamaService.processTextCommand(text, languageHint);
