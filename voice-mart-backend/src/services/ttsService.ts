import logger from '../utils/logger.js';

export class TTSService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.VITE_GOOGLE_TTS_KEY || process.env.GOOGLE_TTS_KEY || process.env.GOOGLE_STT_KEY || '';
        if (!this.apiKey) {
            logger.error('Google TTS API key not configured');
        } else {
            logger.info('TTS Service initialized with Google Cloud API');
        }
    }

    /**
     * Synthesize speech using Google Cloud TTS API
     */
    async synthesizeSpeech(text: string, languageCode: string = 'en-IN'): Promise<string> {
        if (!this.apiKey) {
            throw new Error('Google TTS API key not configured');
        }

        try {
            logger.info(`Generating Google TTS for: "${text.substring(0, 50)}..." (lang: ${languageCode})`);

            // Map standard language codes to Google TTS voice names if needed
            // For now, let Google choose the standard voice for the language
            const requestBody = {
                input: { text },
                voice: { languageCode: languageCode, ssmlGender: 'NEUTRAL' },
                audioConfig: { audioEncoding: 'MP3' }
            };

            const response = await fetch(
                `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Referer': 'http://localhost:3000/' // Add Referer to satisfy API key restriction
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            const data = await response.json() as any;

            if (!response.ok) {
                logger.error('Google TTS API Error:', data);
                throw new Error(data.error?.message || 'TTS generation failed');
            }

            if (!data.audioContent) {
                throw new Error('No audio content received from Google TTS');
            }

            logger.info('TTS generated successfully');
            return data.audioContent;

        } catch (error: any) {
            logger.error('TTS generation failed:', error);
            throw new Error(`TTS Error: ${error.message}`);
        }
    }
}

export const ttsService = new TTSService();
