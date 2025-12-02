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
        
        try {
            // Try primary model (Gemini 2.0 Flash)
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            responseText = response.text();
        } catch (error: any) {
            logger.warn(`Gemini 2.0 Flash failed (${error.message}), falling back to Gemini Pro`);
            
            // Fallback to Gemini Pro
            const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await fallbackModel.generateContent(prompt);
            const response = await result.response;
            responseText = response.text();
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
            return {
                success: false,
                transcript: text,
                action: 'unknown',
                item: '',
                error: 'Failed to parse response',
                timestamp: new Date().toISOString()
            };
        }

    } catch (error: any) {
        logger.error('❌ Error in processTextCommand:', error);
        return {
            success: false,
            transcript: text,
            action: 'unknown',
            item: '',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
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


