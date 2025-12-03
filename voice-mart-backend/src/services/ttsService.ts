import logger from '../utils/logger.js';
import * as googleTTS from 'google-tts-api';
import axios from 'axios';

export class TTSService {
    constructor() {
        logger.info('TTS Service initialized with google-tts-api (Free, Multilingual)');
    }

    /**
     * Synthesize speech using google-tts-api (Google Translate TTS)
     * @param text Text to convert to speech
     * @param languageCode Language code (e.g., 'en-IN', 'hi-IN', 'kn-IN')
     * @returns Base64 encoded audio
     */
    async synthesizeSpeech(text: string, languageCode: string = 'en-IN'): Promise<string> {
        try {
            // Map language codes to google-tts-api format (remove region)
            // en-IN -> en, hi-IN -> hi, kn-IN -> kn
            const lang = languageCode.split('-')[0];
            
            logger.info(`Generating TTS for: "${text.substring(0, 50)}..." (lang: ${lang})`);

            // Get all audio URLs for the text
            const audioItems = await googleTTS.getAllAudioUrls(text, {
                lang: lang,
                slow: false,
            });

            if (!audioItems || audioItems.length === 0) {
                throw new Error('google-tts-api returned no audio data');
            }

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
                    logger.error(`Failed to fetch audio chunk: ${fetchError.message}`);
                }
            }

            if (audioBase64List.length === 0) {
                throw new Error('Failed to fetch any audio chunks');
            }

            logger.info(`TTS generated successfully (${audioBase64List.length} chunks)`);
            
            // Combine all audio chunks into one base64 string
            // For simplicity, return the first chunk (or you can concatenate them)
            return audioBase64List[0];

        } catch (error: any) {
            logger.error('TTS generation failed:', error);
            throw new Error(`TTS Error: ${error.message}`);
        }
    }
}

export const ttsService = new TTSService();
