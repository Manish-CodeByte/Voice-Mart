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
 * Transcribe and understand voice commands from audio file
 * Supports Tulu, Kannada, English, and mixed languages
 * @param {string} audioPath - Path to the WAV audio file
 * @returns {Promise<VoiceCommandResult>} - Parsed JSON with transcript, action, and item
 */
export async function transcribeAndUnderstand(audioPath: string): Promise<VoiceCommandResult> {
    try {
        logger.info(`🎤 Processing audio file: ${audioPath}`);

        // Read the audio file
        const audioBuffer = fs.readFileSync(audioPath);

        // Convert to base64
        const audioBase64 = audioBuffer.toString('base64');

        logger.info(`📦 Audio converted to base64, size: ${audioBase64.length}`);

        // Get the Gemini model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Prepare the prompt
        const prompt = `You are a voice command interpreter for a shopping webapp.
User may speak in Tulu, Kannada, English or mixed.
Your job is to convert the spoken audio into JSON.

Output ONLY JSON in this exact format:
{
  "transcript": "",
  "action": "",
  "item": ""
}

Valid actions:
- add_to_cart
- remove_from_cart
- search
- unknown

Example commands:
"Cart-d pole" → add_to_cart
"Idd item cart-d pole" → add_to_cart
"Onji mobile search malpe" → search
"Item maide remove malpe" → remove_from_cart
"Soap add madle" → add_to_cart

Listen to the audio and extract the command. Return ONLY valid JSON, no other text.`;

        // Prepare audio data for Gemini
        const audioPart = {
            inlineData: {
                data: audioBase64,
                mimeType: 'audio/wav' // Assuming WAV as per user's original code, but could be others
            }
        };

        logger.info('🤖 Sending to Gemini for transcription...');

        // Generate content with audio
        const result = await model.generateContent([prompt, audioPart]);
        const response = await result.response;
        const text = response.text();

        logger.info(`✅ Gemini response: ${text}`);

        // Parse JSON response
        try {
            // Clean the response (remove markdown code blocks if present)
            const cleanText = text
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            const parsed = JSON.parse(cleanText);

            // Validate the response structure
            if (!parsed.transcript || !parsed.action) {
                throw new Error('Invalid response structure');
            }

            logger.info(`📝 Transcript: ${parsed.transcript}`);
            logger.info(`🎯 Action: ${parsed.action}`);
            logger.info(`📦 Item: ${parsed.item || 'N/A'}`);

            return {
                success: true,
                transcript: parsed.transcript,
                action: parsed.action,
                item: parsed.item || '',
                language: detectLanguage(parsed.transcript),
                timestamp: new Date().toISOString()
            };

        } catch (parseError) {
            logger.error('❌ Failed to parse Gemini response:', parseError);

            // Return fallback response
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
        logger.error('❌ Error in transcribeAndUnderstand:', error);

        return {
            success: false,
            transcript: '',
            action: 'unknown',
            item: '',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}
