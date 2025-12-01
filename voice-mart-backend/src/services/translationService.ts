import { translate } from '@vitalets/google-translate-api';
import logger from '../utils/logger.js';

export class TranslationService {
  async translateText(text: string, targetLang: string): Promise<string> {
    try {
      if (!text) return '';
      // Normalize language code if needed (e.g., 'en-US' -> 'en')
      const lang = targetLang.split('-')[0];
      
      if (lang === 'en') return text;

      const { text: translatedText } = await translate(text, { to: lang });
      return translatedText;
    } catch (error) {
      logger.error(`Translation error for "${text}" to ${targetLang}:`, error);
      return text; // Fallback to original
    }
  }

  async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
    try {
        const lang = targetLang.split('-')[0];
        if (lang === 'en') return texts;
        
        // Process in parallel but limit concurrency if needed
        const promises = texts.map(text => this.translateText(text, lang));
        return Promise.all(promises);
    } catch (error) {
        logger.error('Batch translation error:', error);
        return texts;
    }
  }
}

export const translationService = new TranslationService();
