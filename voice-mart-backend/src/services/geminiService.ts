import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

import logger from '../utils/logger.js';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

if (!apiKey) {
    logger.error('GEMINI_API_KEY is not set in environment variables');
}

export interface VoiceCommandResult {
    success: boolean;
    transcript: string;
    action: string;
    item: string;
    entities?: {
        product?: string;
        minPrice?: number;
        maxPrice?: number;
        quantity?: number;
    };
    responseText?: string;
    audioResponse?: string;
    language?: string;
    confidence?: number;
    error?: string;
    timestamp: string;
}

/**
 * @param {string} transcript 
 * @returns {string} 
 */
function detectLanguage(transcript: string): string {
    if (!transcript) return 'unknown';

    const text = transcript.toLowerCase();

    // Kannada detection 
    if (/[\u0C80-\u0CFF]/.test(text)) {
        return 'kannada';
    }

    // Tulu detection
    const tuluWords = ['pole', 'malpe', 'madle', 'maide', 'onji', 'idd'];
    if (tuluWords.some(word => text.includes(word))) {
        return 'tulu';
    }

    // English detection
    if (/^[a-z\s]+$/i.test(text)) {
        return 'english';
    }

    return 'mixed';
}

/**
 * @param {string} audioPath 
 */
export function cleanupAudioFile(audioPath: string): void {
    try {
        if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
            logger.info(`Cleaned up audio file: ${audioPath}`);
        }
    } catch (error) {
        logger.error('Failed to cleanup audio file:', error);
    }
}

/**
 * Process text command with Gemini
 * @param {string} text - The user's spoken text
 * @returns {Promise<VoiceCommandResult>} - Parsed JSON
 */
export async function processTextCommand(text: string): Promise<VoiceCommandResult> {
    try {
        logger.info(`🤖 Processing text command: "${text}"`);

        const prompt = `You are a smart voice assistant for a shopping webapp called "Voice Mart".
User speaks in natural language (English, Kannada, Hindi, etc., but NOT Tulu).
Your job is to understand the intent and return a JSON response.

Output ONLY JSON in this exact format:
{
  "transcript": "The user's spoken text",
  "action": "The action to perform",
  "item": "The product or item mentioned (if any)",
  "responseText": "A natural, friendly response to speak back to the user"
}

Valid actions:
- add_to_cart (if user wants to buy/add something)
- remove_from_cart (if user wants to remove something)
- search (if user is looking for something, including price filters)
- navigate (if user wants to go to a page like 'cart', 'home', 'orders', 'wishlist')
- set_theme (if user wants to change theme to 'dark', 'light', or 'system')
- add_to_wishlist (if user wants to add item to wishlist)
- checkout (if user wants to proceed to checkout)
- unknown (if intent is unclear)

Guidelines for "responseText":
- Keep it short, friendly, and conversational.
- Confirm the action (e.g., "Switching to dark mode", "Heading to checkout").
- If the action is unknown, ask for clarification.
- Respond in the SAME language as the user.

Example interactions:
User: "Change to dark mode"
JSON: {
  "transcript": "Change to dark mode",
  "action": "set_theme",
  "item": "dark",
  "responseText": "Switching to dark mode."
}

User: "Show me mobiles under 50000"
JSON: {
  "transcript": "Show me mobiles under 50000",
  "action": "search",
  "item": "mobiles under 50000",
  "responseText": "Searching for mobiles under 50,000."
}

User Input: "${text}"
Return ONLY valid JSON.`;

        let responseText;
        const maxRetries = 1; 
        let attempt = 0;
        
        while (attempt < maxRetries) {
            try {
                attempt++;
                logger.info(`Attempt ${attempt}/${maxRetries} with gemini-2.0-flash-exp`);
                
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                responseText = response.text();
                
                logger.info('Success with gemini-2.0-flash-exp');
                break; 
                
            } catch (error: any) {
                logger.warn(`Attempt ${attempt} failed: ${error.message}`);
             
                if (error.message.includes('429') || error.message.includes('quota')) {

                    const retryMatch = error.message.match(/retry in ([\d.]+)s/i);
                    let retryDelay = retryMatch ? parseFloat(retryMatch[1]) * 1000 : 2000 * attempt;
                    
                    retryDelay = Math.min(retryDelay, 5000);
                    
                    if (attempt < maxRetries) {
                        logger.info(`⏳ Rate limited. Waiting ${Math.ceil(retryDelay/1000)}s before retry...`);
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                    } else {
                        logger.error('Max retries reached. Falling back to regex.');
                        return fallbackToRegex(text);
                    }
                } else {
                    logger.error(`Non-recoverable error: ${error.message}`);
                    return fallbackToRegex(text);
                }
            }
        }

        logger.info(`Gemini response: ${responseText}`);

        try {
            const cleanText = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            const parsed = JSON.parse(cleanText);

            return {
                success: true,
                transcript: parsed.transcript || text,
                action: parsed.action,
                item: parsed.item || '',
                responseText: parsed.responseText || '',
                language: detectLanguage(text),
                timestamp: new Date().toISOString()
            };

        } catch (parseError) {
            logger.error('Failed to parse Gemini response:', parseError);
            return fallbackToRegex(text);
        }

    } catch (error: any) {
        logger.error('Error in processTextCommand:', error);
        return fallbackToRegex(text);
    }
}

function fallbackToRegex(text: string): VoiceCommandResult {
    const lower = text.toLowerCase().trim();
    let action = 'unknown';
    let item = '';
    let responseText = "I'm sorry, I didn't understand that.";
    let detectedLang = 'en-IN';

    // Detect language from script
    if (/[\u0900-\u097F]/.test(text)) {
        detectedLang = 'hi-IN'; // Hindi
        responseText = "मुझे समझ नहीं आया।";
    } else if (/[\u0C80-\u0CFF]/.test(text)) {
        detectedLang = 'kn-IN'; // Kannada
        responseText = "ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ.";
    }

    // 1. Checkout
    if (lower.match(/\b(checkout|check out)\b/) || 
        lower.includes('चेकआउट') || lower.includes('ಚೆಕ್‌ಔಟ್')) {
        action = 'checkout';
        responseText = detectedLang === 'hi-IN' ? 'चेकआउट पर जा रहे हैं।' :
                       detectedLang === 'kn-IN' ? 'ಚೆಕ್‌ಔಟ್‌ಗೆ ಹೋಗುತ್ತಿದ್ದೇವೆ.' :
                       'Proceeding to checkout.';
    }
    
    // 2. Navigation
    else if (lower.match(/\b(open|go to|show|view)\b.*\bcart\b/) ||
             lower.includes('कार्ट') || lower.includes('ಕಾರ್ಟ್')) {
        action = 'navigate';
        item = 'cart';
        responseText = detectedLang === 'hi-IN' ? 'कार्ट खोल रहे हैं।' :
                       detectedLang === 'kn-IN' ? 'ಕಾರ್ಟ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.' :
                       'Opening your cart.';
    }
    
    // 3. Navigation
    else if (lower.match(/\b(home|main page|homepage)\b/) ||
             lower.includes('होम') || lower.includes('ಮುಖಪುಟ')) {
        action = 'navigate';
        item = 'home';
        responseText = detectedLang === 'hi-IN' ? 'होम पेज पर जा रहे हैं।' :
                       detectedLang === 'kn-IN' ? 'ಮುಖಪುಟಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇವೆ.' :
                       'Going to home page.';
    }
    
    // 4. Navigation 
    else if (lower.match(/\b(order|orders|my order)\b/) ||
             lower.includes('ऑर्डर') || lower.includes('ಆರ್ಡರ್')) {
        action = 'navigate';
        item = 'orders';
        responseText = detectedLang === 'hi-IN' ? 'आपके ऑर्डर दिखा रहे हैं।' :
                       detectedLang === 'kn-IN' ? 'ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇವೆ.' :
                       'Showing your orders.';
    }
    
    // 5. Theme 
    else if (lower.match(/\b(dark mode|dark theme|enable dark|switch to dark)\b/) ||
             lower.includes('डार्क मोड') || lower.includes('ಡಾರ್ಕ್ ಮೋಡ್')) {
        action = 'set_theme';
        item = 'dark';
        responseText = detectedLang === 'hi-IN' ? 'डार्क मोड में बदल रहे हैं।' :
                       detectedLang === 'kn-IN' ? 'ಡಾರ್ಕ್ ಮೋಡ್‌ಗೆ ಬದಲಾಯಿಸುತ್ತಿದ್ದೇವೆ.' :
                       'Switching to dark mode.';
    }
    
    // 6. Search 
    else if (lower.match(/\b(search|find|show|looking for|i want|get me)\b/) ||
             lower.includes('खोज') || lower.includes('ಹುಡುಕು') ||
             lower.includes('दिखाओ') || lower.includes('ತೋರಿಸು')) {
        action = 'search';
        const patterns = [
            /(?:search for|find|show me|looking for|i want|get me|खोज|ढूंढो|दिखाओ|ಹುಡುಕು|ತೋರಿಸು)\s+(.+)/,
            /(.+)\s+(?:please|pls|कृपया|ದಯವಿಟ್ಟು)$/,
        ];
        
        for (const pattern of patterns) {
            const match = lower.match(pattern);
            if (match) {
                item = match[1].trim();
                break;
            }
        }
        
        if (!item) item = lower;
        responseText = detectedLang === 'hi-IN' ? `${item} खोज रहे हैं।` :
                       detectedLang === 'kn-IN' ? `${item} ಹುಡುಕುತ್ತಿದ್ದೇವೆ.` :
                       `Searching for ${item}.`;
    }

    logger.info(`Regex Fallback: action="${action}", item="${item}", lang="${detectedLang}"`);

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

/**
 * Transcribe and understand voice commands from audio file
 * Supports Tulu, Kannada, English, and mixed languages
 * @param {string} audioPath - Path to the WAV audio file
 * @returns {Promise<VoiceCommandResult>} - Parsed JSON with transcript, action, and item
 */
export async function transcribeAndUnderstand(audioPath: string): Promise<VoiceCommandResult> {
    // This function is deprecated for direct audio-to-gemini if gemini-1.5-flash is unavailable.
    // However, we keep it signature-compatible but throw error or redirect if needed.
    // For now, let's just return error so controller handles it? 
    // Or better, we can't easily call STT here without circular deps or code duplication.
    // Let's modify the controller to call STT then processTextCommand.
    throw new Error("Direct Audio-to-Gemini not supported with current model configuration. Use STT + processTextCommand.");
}


