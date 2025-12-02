import { HfInference } from '@huggingface/inference';
import logger from '../utils/logger.js';

export interface VoiceCommandResult {
    success: boolean;
    transcript: string;
    action: string;
    item: string;
    responseText?: string;
    audioResponse?: string;
    language?: string;
    error?: string;
    timestamp?: string;
}

// Initialize Hugging Face (FREE - no API key needed for public models)
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || ''); // Optional key for higher rate limits

/**
 * Process text command with Hugging Face FREE model
 */
export async function processTextCommand(text: string): Promise<VoiceCommandResult> {
    try {
        logger.info(`🤖 Processing with Hugging Face: "${text}"`);

        const prompt = `You are a voice assistant for an e-commerce app. Analyze this command and return ONLY a JSON object.

User said: "${text}"

Return this exact JSON format:
{
  "action": "search|navigate|set_theme|checkout|add_to_cart|remove_from_cart|unknown",
  "item": "extracted item or page name",
  "responseText": "friendly response in the SAME language as user"
}

Valid actions:
- search: user wants to find products
- navigate: user wants to go to cart/home/orders/wishlist
- set_theme: user wants dark/light mode
- checkout: user wants to checkout
- add_to_cart: user wants to add item
- remove_from_cart: user wants to remove item
- unknown: unclear intent

Examples:
"go to cart" → {"action":"navigate","item":"cart","responseText":"Opening cart"}
"कार्ट खोलो" → {"action":"navigate","item":"cart","responseText":"कार्ट खोल रहे हैं"}
"show me shoes" → {"action":"search","item":"shoes","responseText":"Searching for shoes"}

Return ONLY the JSON, nothing else.`;

        const response = await hf.textGeneration({
            model: 'mistralai/Mistral-7B-Instruct-v0.1', // FREE model
            inputs: prompt,
            parameters: {
                max_new_tokens: 150,
                temperature: 0.3,
                return_full_text: false,
            }
        });

        logger.info(`✅ HF Response: ${response.generated_text}`);

        // Parse JSON from response
        const jsonMatch = response.generated_text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            success: true,
            transcript: text,
            action: parsed.action || 'unknown',
            item: parsed.item || '',
            responseText: parsed.responseText || "I'm here to help!",
            language: detectLanguage(text),
            timestamp: new Date().toISOString()
        };

    } catch (error: any) {
        logger.error('❌ Hugging Face error:', error);
        // Fallback to regex
        return fallbackToRegex(text);
    }
}

/**
 * Detect language from text
 */
function detectLanguage(text: string): string {
    if (/[\u0900-\u097F]/.test(text)) return 'hi-IN'; // Hindi
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN'; // Kannada
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN'; // Tamil
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN'; // Telugu
    return 'en-IN'; // English
}

/**
 * Regex fallback (last resort)
 */
function fallbackToRegex(text: string): VoiceCommandResult {
    const lower = text.toLowerCase().trim();
    let action = 'unknown';
    let item = '';
    let responseText = "I'm sorry, I didn't understand that.";
    const detectedLang = detectLanguage(text);

    // Checkout
    if (lower.match(/\b(checkout|check out)\b/) || lower.includes('चेकआउट')) {
        action = 'checkout';
        responseText = detectedLang === 'hi-IN' ? 'चेकआउट पर जा रहे हैं।' : 'Proceeding to checkout.';
    }
    // Cart
    else if (lower.match(/\b(cart|कार्ट|ಕಾರ್ಟ್)\b/)) {
        action = 'navigate';
        item = 'cart';
        responseText = detectedLang === 'hi-IN' ? 'कार्ट खोल रहे हैं।' : 
                       detectedLang === 'kn-IN' ? 'ಕಾರ್ಟ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.' : 
                       'Opening cart.';
    }
    // Orders
    else if (lower.match(/\b(order|ऑर्डर|ಆರ್ಡರ್)\b/)) {
        action = 'navigate';
        item = 'orders';
        responseText = detectedLang === 'hi-IN' ? 'ऑर्डर दिखा रहे हैं।' : 'Showing orders.';
    }
    // Search
    else if (lower.match(/\b(show|find|search|खोज|ಹುಡುಕು)\b/)) {
        action = 'search';
        item = text;
        responseText = detectedLang === 'hi-IN' ? `${item} खोज रहे हैं।` : `Searching for ${item}.`;
    }

    logger.info(`🔄 Regex Fallback: action="${action}"`);

    return {
        success: true,
        transcript: text,
        action,
        item,
        responseText,
        language: detectedLang,
        timestamp: new Date().toISOString()
    };
}

export { fallbackToRegex };
