import { VoiceTranscriptionResponse } from '../types/index.js';
import logger from '../utils/logger.js';

interface STTConfig {
    encoding: string;
    sampleRateHertz: number;
    languageCode: string;
    alternativeLanguageCodes?: string[];
    enableAutomaticPunctuation: boolean;
    model: string;
}

export class STTService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.VITE_GOOGLE_STT_KEY || process.env.GOOGLE_STT_KEY || '';
        if (!this.apiKey) {
            logger.error('Google STT API key not configured');
        } else {
            logger.info('STT Service initialized with Google Cloud API');
        }
    }

    async transcribeAudio(audioBase64: string, languageCode: string = 'en-IN'): Promise<VoiceTranscriptionResponse> {
        // Use multi-language detection by default
        return this.callGoogleSTT(audioBase64, {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: languageCode, // Use provided language as primary
            alternativeLanguageCodes: ['en-IN', 'hi-IN', 'kn-IN', 'ta-IN', 'te-IN'], // Auto-detect others
            enableAutomaticPunctuation: true,
            model: 'latest_long',
        });
    }

    async transcribeMultiLang(audioBase64: string, languages: string[]): Promise<VoiceTranscriptionResponse> {
        return this.callGoogleSTT(audioBase64, {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: languages[0],
            alternativeLanguageCodes: languages.slice(1),
            enableAutomaticPunctuation: true,
            model: 'latest_long',
        });
    }

    private async callGoogleSTT(audioBase64: string, config: STTConfig): Promise<VoiceTranscriptionResponse> {
        if (!this.apiKey) {
            throw new Error('Google STT API key not configured');
        }

        try {
            logger.info('Calling Google STT...');

            const response = await fetch(
                `https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Referer': 'http://localhost:3000/' // Add Referer to satisfy API key restriction
                    },
                    body: JSON.stringify({
                        config,
                        audio: {
                            content: audioBase64,
                        },
                    }),
                }
            );

            const data = await response.json() as any;

            if (!response.ok) {
                logger.error('Google STT API Error:', data);
                throw new Error(data.error?.message || 'Speech recognition failed');
            }

            const result = data.results?.[0];
            const alternative = result?.alternatives?.[0];
            const transcript = alternative?.transcript || '';
            const confidence = alternative?.confidence || 0;
            const detectedLanguage = result?.languageCode || config.languageCode;

            logger.info(`Transcription: "${transcript}" (Lang: ${detectedLanguage})`);

            return {
                text: transcript,
                confidence,
                language: detectedLanguage,
            };
        } catch (error: any) {
            logger.error('STT Service Error:', error);
            throw error;
        }
    }
}

export const sttService = new STTService();
