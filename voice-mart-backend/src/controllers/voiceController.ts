import { Request, Response, NextFunction } from 'express';
import { sttService } from '../services/sttService.js';
import { transcribeAndUnderstand, cleanupAudioFile } from '../services/geminiService.js';
import logger from '../utils/logger.js';

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
        logger.info('📥 Received voice command request');

        // Check if file was uploaded
        if (!req.file) {
            res.status(400).json({
                success: false,
                error: 'No audio file uploaded'
            });
            return;
        }

        logger.info(`📁 File uploaded: ${req.file.filename}`);
        logger.info(`📊 File size: ${req.file.size} bytes`);
        logger.info(`🎵 MIME type: ${req.file.mimetype}`);

        // Process the audio file with Gemini
        const result = await transcribeAndUnderstand(req.file.path);

        // Clean up the uploaded file
        cleanupAudioFile(req.file.path);

        // Return the result
        res.json(result);

    } catch (error: any) {
        logger.error('❌ Error processing voice command:', error);

        // Clean up file if it exists
        if (req.file) {
            cleanupAudioFile(req.file.path);
        }

        next(error);
    }
};
