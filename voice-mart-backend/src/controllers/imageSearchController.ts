import { Request, Response } from 'express';
import visionService from '../services/visionService.js';
import productService from '../services/productService.js';
import logger from '../utils/logger.js';

export const searchByImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided',
            });
        }

        logger.info(`Image search request: ${req.file.originalname} (${req.file.size} bytes)`);

        // Convert image to base64
        const imageBase64 = req.file.buffer.toString('base64');

        // Analyze image with Google Vision API
        const { labels, text, webEntities } = await visionService.analyzeImage(imageBase64);

        // Extract keywords for product search
        const keywords = visionService.extractProductKeywords(labels, text, webEntities);
        logger.info(`Extracted keywords: ${keywords.join(', ')}`);

        // Search for products using productService
        const allProducts = await productService.getAllProducts({});
        const products = searchProducts(allProducts, keywords);

        logger.info(`Found ${products.length} matching products`);

        return res.json({
            success: true,
            data: products,
            metadata: {
                labels,
                text: text.substring(0, 200),
                keywords,
                totalResults: products.length,
            },
        });
    } catch (error) {
        logger.error('Image search error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process image search',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Search products based on extracted keywords
 */
function searchProducts(products: any[], keywords: string[]): any[] {
    try {
        // Score and filter products by relevance
        const scoredProducts = products.map(product => {
            let score = 0;
            const productText = `${product.name} ${product.description} ${product.category} ${product.tags?.join(' ')}`.toLowerCase();

            keywords.forEach(keyword => {
                if (productText.includes(keyword.toLowerCase())) {
                    // Higher score for matches in name
                    if (product.name.toLowerCase().includes(keyword.toLowerCase())) {
                        score += 3;
                    }
                    // Medium score for category
                    if (product.category?.toLowerCase().includes(keyword.toLowerCase())) {
                        score += 2;
                    }
                    // Lower score for description/tags
                    if (product.description?.toLowerCase().includes(keyword.toLowerCase()) || 
                        product.tags?.some((tag: string) => tag.toLowerCase().includes(keyword.toLowerCase()))) {
                        score += 1;
                    }
                }
            });

            return { product, score };
        });

        // Sort by score (highest first) and return top 20 products
        return scoredProducts
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20)
            .map(item => item.product);
    } catch (error) {
        logger.error('Product search error:', error);
        return [];
    }
}
