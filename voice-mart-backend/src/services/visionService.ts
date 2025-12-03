import vision from '@google-cloud/vision';
import logger from '../utils/logger.js';

class VisionService {
    private client: vision.ImageAnnotatorClient;

    constructor() {
        // Initialize Vision API client with API key
        const apiKey = process.env.GOOGLE_VISION_KEY || process.env.GOOGLE_STT_KEY;
        
        if (!apiKey) {
            logger.error('Google Vision API key not found in environment variables');
            throw new Error('GOOGLE_VISION_KEY or GOOGLE_STT_KEY must be set');
        }

        this.client = new vision.ImageAnnotatorClient({
            apiKey: apiKey,
        });
        
        logger.info('Google Vision API client initialized');
    }

    /**
     * Analyze image and extract labels, text, and other features
     */
    async analyzeImage(imageBase64: string): Promise<{
        labels: string[];
        text: string;
        webEntities: string[];
    }> {
        try {
            logger.info('Analyzing image with Google Vision API');

            const request = {
                image: { content: imageBase64 },
                features: [
                    { type: 'LABEL_DETECTION' as const, maxResults: 10 },
                    { type: 'TEXT_DETECTION' as const },
                    { type: 'WEB_DETECTION' as const },
                    { type: 'LOGO_DETECTION' as const },
                ],
            };

            const [result] = await this.client.annotateImage(request);

            // Extract labels
            const labels = result.labelAnnotations?.map(label => label.description || '') || [];
            logger.info(`Detected labels: ${labels.join(', ')}`);

            // Extract text
            const text = result.textAnnotations?.[0]?.description || '';
            logger.info(`Detected text: ${text.substring(0, 100)}...`);

            // Extract web entities (similar products/brands)
            const webEntities = result.webDetection?.webEntities
                ?.map(entity => entity.description || '')
                .filter(desc => desc.length > 0) || [];
            logger.info(`Web entities: ${webEntities.join(', ')}`);

            // Extract logos
            const logos = result.logoAnnotations?.map(logo => logo.description || '') || [];
            if (logos.length > 0) {
                logger.info(`Detected logos: ${logos.join(', ')}`);
            }

            return {
                labels: [...labels, ...logos],
                text,
                webEntities,
            };
        } catch (error) {
            logger.error('Vision API error:', error);
            throw new Error('Failed to analyze image');
        }
    }

    /**
     * Extract product-relevant keywords from Vision API results
     */
    extractProductKeywords(labels: string[], text: string, webEntities: string[]): string[] {
        const keywords = new Set<string>();

        // Add labels (objects detected in image)
        labels.forEach(label => {
            keywords.add(label.toLowerCase());
        });

        // Extract words from text (brand names, product names)
        const textWords = text
            .split(/\s+/)
            .filter(word => word.length > 2)
            .map(word => word.toLowerCase().replace(/[^a-z0-9]/g, ''));
        
        textWords.forEach(word => keywords.add(word));

        // Add web entities (similar products found online)
        webEntities.forEach(entity => {
            keywords.add(entity.toLowerCase());
        });

        return Array.from(keywords).filter(k => k.length > 0);
    }
}

export default new VisionService();
