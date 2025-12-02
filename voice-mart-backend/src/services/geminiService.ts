import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

import logger from '../utils/logger.js';

// Initialize Gemini AI
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
    responseText?: string;
    audioResponse?: string; // Base64 audio
    language?: string;
    error?: string;
    timestamp?: string;
}

/**
 * Detect language from transcript
 * @param {string} transcript - The transcribed text
 * @returns {string} - Detected language
 */
function detectLanguage(transcript: string): string {
    if (!transcript) return 'unknown';

    const text = transcript.toLowerCase();

    // Kannada detection (contains Kannada script)
    if (/[\u0C80-\u0CFF]/.test(text)) {
        return 'kannada';
    }

    // Tulu detection (common Tulu words)
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
 * Clean up uploaded audio file
 * @param {string} audioPath - Path to the audio file
 */
export function cleanupAudioFile(audioPath: string): void {
    try {
        if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
            logger.info(`🗑️ Cleaned up audio file: ${audioPath}`);
        }
    } catch (error) {
        logger.error('⚠️ Failed to cleanup audio file:', error);
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
        const maxRetries = 1; // Reduced from 3 to 1 for faster fallback
        let attempt = 0;
        
        // Only use gemini-2.0-flash-exp with retry logic
        while (attempt < maxRetries) {
            try {
                attempt++;
                logger.info(`🔄 Attempt ${attempt}/${maxRetries} with gemini-2.0-flash-exp`);
                
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                responseText = response.text();
                
                logger.info(`✅ Success with gemini-2.0-flash-exp`);
                break; // Success! Exit loop
                
            } catch (error: any) {
                logger.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
                
                // Check if it's a rate limit error (429)
                if (error.message.includes('429') || error.message.includes('quota')) {
                    // Extract retry delay from error message
                    const retryMatch = error.message.match(/retry in ([\d.]+)s/i);
                    let retryDelay = retryMatch ? parseFloat(retryMatch[1]) * 1000 : 2000 * attempt;
                    
                    // Cap at 5 seconds max (don't wait 60+ seconds)
                    retryDelay = Math.min(retryDelay, 5000);
                    
                    if (attempt < maxRetries) {
                        logger.info(`⏳ Rate limited. Waiting ${Math.ceil(retryDelay/1000)}s before retry...`);
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                    } else {
                        logger.error('❌ Max retries reached. Falling back to regex.');
                        return fallbackToRegex(text);
                    }
                } else {
                    // Non-rate-limit error, fallback immediately
                    logger.error(`❌ Non-recoverable error: ${error.message}`);
                    return fallbackToRegex(text);
                }
            }
        }

        logger.info(`✅ Gemini response: ${responseText}`);

        // Parse JSON response
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
            logger.error('❌ Failed to parse Gemini response:', parseError);
            return fallbackToRegex(text);
        }

    } catch (error: any) {
        logger.error('❌ Error in processTextCommand:', error);
        return fallbackToRegex(text);
    }
}

/**
 * Rule-Based Fallback for when AI fails
 * Uses Regex to match common intents
 */
function fallbackToRegex(text: string): VoiceCommandResult {
    const lower = text.toLowerCase();
    let action = 'unknown';
    let item = '';
    let responseText = "I'm sorry, I didn't understand that.";

    // 1. Navigation
    if (lower.includes('cart') && (lower.includes('open') || lower.includes('go') || lower.includes('show'))) {
        action = 'navigate';
        item = 'cart';
        responseText = "Opening your cart.";
    } else if (lower.includes('home') || lower.includes('main')) {
        action = 'navigate';
        item = 'home';
        responseText = "Going to home page.";
    } else if (lower.includes('wishlist')) {
        action = 'navigate';
        item = 'wishlist';
        responseText = "Opening your wishlist.";
    } else if (lower.includes('order')) {
        action = 'navigate';
        item = 'orders';
        responseText = "Showing your orders.";
    }
    
    // 2. Theme
    else if (lower.includes('dark mode') || lower.includes('dark theme')) {
        action = 'set_theme';
        item = 'dark';
        responseText = "Switching to dark mode.";
    } else if (lower.includes('light mode') || lower.includes('light theme')) {
        action = 'set_theme';
        item = 'light';
        responseText = "Switching to light mode.";
    }

    // 3. Cart Operations
    else if (lower.includes('add') || lower.includes('buy')) {
        action = 'add_to_cart';
        // Extract item: "add red shoes to cart" -> "red shoes"
        const match = lower.match(/(?:add|buy)\s+(.*?)(?:\s+to\s+cart)?$/);
        item = match ? match[1] : '';
        responseText = `Adding ${item} to cart.`;
    } else if (lower.includes('remove') || lower.includes('delete')) {
        action = 'remove_from_cart';
        const match = lower.match(/(?:remove|delete)\s+(.*?)(?:\s+from\s+cart)?$/);
        item = match ? match[1] : '';
        responseText = `Removing ${item} from cart.`;
    }

    // 4. Search (Default fallback for "show me", "find", etc.)
    else if (lower.includes('search') || lower.includes('find') || lower.includes('show') || lower.includes('looking for')) {
        action = 'search';
        const match = lower.match(/(?:search for|find|show me|looking for)\s+(.*)/);
        item = match ? match[1] : lower;
        responseText = `Searching for ${item}.`;
    }
    
    // 5. Checkout
    else if (lower.includes('checkout') || lower.includes('buy now')) {
        action = 'checkout';
        responseText = "Proceeding to checkout.";
    }

    return {
        success: true,
        transcript: text,
        action,
        item,
        responseText,
        language: detectLanguage(text),
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


