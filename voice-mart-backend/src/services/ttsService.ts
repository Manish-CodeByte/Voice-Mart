import logger from '../utils/logger.js';

interface TTSConfig {
    languageCode: string;
    name?: string;
    ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
}

export class TTSService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.GOOGLE_TTS_KEY || process.env.GOOGLE_STT_KEY || '';
        if (!this.apiKey) {
            logger.error('Google TTS API key not configured');
        }
    }

    async synthesizeSpeech(text: string, languageCode: string = 'en-IN'): Promise<string> {
        if (!this.apiKey) {
            throw new Error('Google TTS API key not configured');
        }

        try {
            logger.info(`Synthesizing speech for: "${text.substring(0, 50)}..." in ${languageCode}`);

            // Map common language codes to Google TTS voice names
            // We want natural sounding neural voices if available
            let voiceName = 'en-IN-Neural2-A'; // Default English India
            let ssmlGender = 'FEMALE';

            if (languageCode.startsWith('hi')) {
                voiceName = 'hi-IN-Neural2-A';
            } else if (languageCode.startsWith('kn')) {
                voiceName = 'kn-IN-Standard-A'; // Neural might not be available for Kannada yet
            } else if (languageCode.startsWith('ta')) {
                voiceName = 'ta-IN-Standard-A';
            } else if (languageCode.startsWith('te')) {
                voiceName = 'te-IN-Standard-A';
            } else if (languageCode.startsWith('ml')) {
                voiceName = 'ml-IN-Standard-A';
            }

            const response = await fetch(
                `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        input: { text },
                        voice: {
                            languageCode,
                            name: voiceName,
                            ssmlGender
                        },
                        audioConfig: {
                            audioEncoding: 'MP3'
                        }
                    }),
                }
            );

            const data = await response.json() as any;

            if (!response.ok) {
                logger.error('Google TTS API Error:', data);
                throw new Error(data.error?.message || 'Speech synthesis failed');
            }

            if (!data.audioContent) {
                throw new Error('No audio content received from TTS API');
            }

            logger.info('Speech synthesis successful');
            return data.audioContent; // This is base64 encoded MP3
        } catch (error: any) {
            logger.error('TTS Service Error:', error);
            throw error;
        }
    }
}

export const ttsService = new TTSService();
