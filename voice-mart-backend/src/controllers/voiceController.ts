import { Request, Response, NextFunction } from 'express';
import { sttService } from '../services/sttService.js';
import { transcribeAndUnderstand, cleanupAudioFile } from '../services/geminiService.js';
import { ttsService } from '../services/ttsService.js';
import logger from '../utils/logger.js';
import fs from 'fs';

export const transcribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { audioBase64, languageCode = 'en-IN' } = req.body;

        if (!audioBase64) {
            res.status(400).json({ error: 'No audio data provided' });
            return;
        }

        const result = await sttService.transcribeAudio(audioBase64, languageCode);

        res.json({
            ...result,
            transcript: result.text, // For backward compatibility
            success: true
        });
    } catch (error: any) {
        logger.error('Transcribe Controller Error:', error);
        next(error);
    }
};

export const transcribeMultiLang = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { audioBase64, languages } = req.body;

        if (!audioBase64) {
            res.status(400).json({ error: 'No audio data provided' });
            return;
        }

        const result = await sttService.transcribeMultiLang(audioBase64, languages);

        res.json({
            ...result,
            transcript: result.text, // For backward compatibility
            success: true
        });
    } catch (error: any) {
        logger.error('Multi-lang Transcribe Controller Error:', error);
        next(error);
    }
};

export const processVoiceCommand = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logger.info('Received voice command request');

        if (!req.file) {
            res.status(400).json({
                success: false,
                error: 'No audio file uploaded'
            });
            return;
        }

        logger.info(`File uploaded: ${req.file.filename}`);
        logger.info(`File size: ${req.file.size} bytes`);
        logger.info(`MIME type: ${req.file.mimetype}`);

        const audioBuffer = fs.readFileSync(req.file.path);
        const audioBase64 = audioBuffer.toString('base64');
        
        // Get language from request body (sent by frontend)
        const languageCode = req.body.languageCode || 'en-IN';
        logger.info(`Processing voice command in language: ${languageCode}`);
        
        const context = req.body.context ? JSON.parse(req.body.context) : null;
        if (context) {
            logger.info(`Context received: ${JSON.stringify(context)}`);
        }

        // 1. Transcribe Audio (Google STT)
        const sttResult = await sttService.transcribeAudio(audioBase64, languageCode);
        logger.info(`Transcribed text: ${sttResult.text} (Detected: ${sttResult.language})`);

        // 2. Understand Intent (Local Ollama AI)
        const { processTextCommand, setContext } = await import('../services/ollamaService.js');
        
        // Set context for Ollama if available
        if (context) {
            setContext(context);
        }
        
        // Pass the language code as a hint to Ollama
        const result = await processTextCommand(sttResult.text, languageCode);

        // Resolve "current_product" to actual productId if context is available
        if (result.item === 'current_product' && context?.productId) {
            result.item = context.productId;
            logger.info(`Resolved 'current_product' to '${context.productId}'`);
        } else if (result.item === 'current_product' && !context?.productId) {
            logger.warn("Command referred to 'current_product' but no product context found.");
            // Optionally, we could change the response text here to inform the user
        }


        // Generate audio response if text response exists
        if (result.success && result.responseText) {
            try {
                // Use the language detected by STT (not Ollama's 'auto')
                // STT returns proper language codes like 'en-IN', 'hi-IN', 'kn-IN'
                const ttsLanguageCode = sttResult.language || languageCode || 'en-IN';
                
                logger.info(`Using TTS language: ${ttsLanguageCode} (detected by STT: ${sttResult.language})`);
                
                const audioContent = await ttsService.synthesizeSpeech(result.responseText, ttsLanguageCode);
                result.audioResponse = audioContent;
            } catch (ttsError: any) {
                logger.error('TTS generation failed:', ttsError);
                result.error = `TTS Error: ${ttsError.message}`;
            }
        }
        cleanupAudioFile(req.file.path);
        res.json(result);

    } catch (error: any) {
        logger.error('Error processing voice command:', error);

        if (req.file) {
            cleanupAudioFile(req.file.path);
        }

        next(error);
    }
};
