import * as googleTTS from 'google-tts-api';
import axios from 'axios';
import logger from '../utils/logger.js';

export class TTSService {
    constructor() {
        logger.info('TTS Service initialized with google-tts-api (no API key needed)');
    }

    /**
     * Synthesize speech from text using google-tts-api
     * @param text - Text to convert to speech
     * @param languageCode - Language code (e.g., 'en-IN', 'hi-IN', 'kn-IN')
     * @returns Base64 encoded audio (MP3)
     */
    async synthesizeSpeech(text: string, languageCode: string = 'en-IN'): Promise<string> {
        try {
            logger.info(`🔊 Generating TTS for: "${text.substring(0, 50)}..." (lang: ${languageCode})`);

            // Get audio URLs from google-tts-api
            const audioItems = await googleTTS.getAllAudioUrls(text, {
                lang: languageCode,
                slow: false,
            });

            if (!audioItems || audioItems.length === 0) {
                throw new Error('No audio data returned from TTS API');
            }

            logger.info(`📦 Fetching ${audioItems.length} audio chunks...`);

            const audioBase64List: string[] = [];

            // Fetch each audio chunk
            for (const item of audioItems) {
                try {
                    const response = await axios.get(item.url, {
                        responseType: 'arraybuffer',
                        timeout: 10000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    const base64Audio = Buffer.from(response.data).toString('base64');
                    audioBase64List.push(base64Audio);
                } catch (fetchError: any) {
                    logger.error(`❌ Failed to fetch audio chunk: ${fetchError.message}`);
                    // Continue with other chunks
                }
            }

            if (audioBase64List.length === 0) {
                throw new Error('Failed to fetch any audio chunks');
            }

            logger.info(`✅ Successfully fetched ${audioBase64List.length} audio chunks`);

            // Return the first chunk (for simplicity)
            return audioBase64List[0];

        } catch (error: any) {
            logger.error('❌ TTS generation failed:', error);
            throw new Error(`TTS Error: ${error.message}`);
        }
    }
}

export const ttsService = new TTSService();
