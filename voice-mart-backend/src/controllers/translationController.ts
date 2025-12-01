import { Request, Response } from 'express';
import { translationService } from '../services/translationService.js';
import logger from '../utils/logger.js';

export const translateText = async (req: Request, res: Response) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      res.status(400).json({ success: false, message: 'Text and targetLang are required' });
      return;
    }

    const translatedText = await translationService.translateText(text, targetLang);
    res.json({ success: true, text: translatedText });
  } catch (error) {
    logger.error('Translation controller error:', error);
    res.status(500).json({ success: false, message: 'Translation failed' });
  }
};

export const translateBatch = async (req: Request, res: Response) => {
    try {
      const { texts, targetLang } = req.body;
  
      if (!texts || !Array.isArray(texts) || !targetLang) {
        res.status(400).json({ success: false, message: 'Texts array and targetLang are required' });
        return;
      }
  
      const translatedTexts = await translationService.translateBatch(texts, targetLang);
      res.json({ success: true, texts: translatedTexts });
    } catch (error) {
      logger.error('Batch translation controller error:', error);
      res.status(500).json({ success: false, message: 'Translation failed' });
    }
  };
