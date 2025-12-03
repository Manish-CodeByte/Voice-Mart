import logger from '../utils/logger.js';
import ollama from 'ollama';
import { VoiceCommandResult } from './geminiService.js';

/**
 * Pre-process voice command text to fix common issues
 */
function preprocessCommand(text: string): string {
    let processed = text.toLowerCase().trim();
    
    // Phonetic corrections (common mishearings)
    const phoneticMap: Record<string, string> = {
        'card': 'cart',
        'kart': 'cart',
        'carts': 'cart',
        'fone': 'phone',
        'fones': 'phones',
        'lappy': 'laptop',
        'lappies': 'laptops',
        'mobiles': 'phones',
        'mobile': 'phone',
        // Language name corrections (STT mishearings)
        'canada': 'kannada',
        'kanada': 'kannada',
        'canara': 'kannada',
        'hindi': 'hindi',
        'hindy': 'hindi',
        'tamil': 'tamil',
        'tamul': 'tamil',
        'telugu': 'telugu',
        'telgu': 'telugu',
        'malayalam': 'malayalam',
        'malaylam': 'malayalam',
    };
    
    // Replace phonetic errors
    Object.entries(phoneticMap).forEach(([wrong, correct]) => {
        const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
        processed = processed.replace(regex, correct);
    });
    
    // Normalize common phrases
    processed = processed.replace(/\bthis item\b/gi, 'current_product');
    processed = processed.replace(/\bthat one\b/gi, 'current_product');
    processed = processed.replace(/\bthis one\b/gi, 'current_product');
    
    logger.info(`Preprocessed: "${text}" -> "${processed}"`);
    return processed;
}

/**
 * Extract entities from text (price, quantity, product)
 */
interface ExtractedEntities {
    product?: string;
    minPrice?: number;
    maxPrice?: number;
    quantity?: number;
}

function extractEntities(text: string): ExtractedEntities {
    const entities: ExtractedEntities = {};
    
    // Extract price ranges
    const pricePatterns = [
        /under\s+(\d+)k?/i,
        /below\s+(\d+)k?/i,
        /less\s+than\s+(\d+)k?/i,
        /cheaper\s+than\s+(\d+)k?/i,
    ];
    
    for (const pattern of pricePatterns) {
        const match = text.match(pattern);
        if (match) {
            let price = parseInt(match[1]);
            // Handle "5k" -> 5000
            if (text.includes('k') || text.includes('K')) {
                price *= 1000;
            }
            entities.maxPrice = price;
            break;
        }
    }
    
    // Extract quantity
    const quantityPattern = /(\d+)\s+(items?|pieces?|units?)/i;
    const qtyMatch = text.match(quantityPattern);
    if (qtyMatch) {
        entities.quantity = parseInt(qtyMatch[1]);
    }
    
    return entities;
}

export class OllamaService {
    private model: string;
    private conversationContext: any = null; // Track conversation context

    constructor(model: string = 'mistral') {
        this.model = model;
    }

    /**
     * Set context for the current conversation (e.g., current product page)
     */
    setContext(context: any) {
        this.conversationContext = context;
        logger.info(`Context set: ${JSON.stringify(context)}`);
    }

    /**
     * Process text command using local Ollama model with advanced NLP
     */
    async processTextCommand(text: string, languageHint?: string): Promise<VoiceCommandResult> {
        try {
            // Phase 1: Pre-processing
            const preprocessed = preprocessCommand(text);
            
            // Phase 3: Entity extraction
            const entities = extractEntities(preprocessed);
            
            logger.info(`Ollama Processing: "${text}" (Model: ${this.model}, Hint: ${languageHint})`);
            logger.info(`Entities extracted: ${JSON.stringify(entities)}`);

            // Phase 2: Enhanced prompt with entity extraction and fuzzy matching
            const contextInfo = this.conversationContext 
                ? `\n- **Current Context:** User is viewing: ${JSON.stringify(this.conversationContext)}`
                : '';

            const prompt = `You are an advanced, multilingual voice assistant for "Voice Mart", an e-commerce platform.

**USER INPUT:** "${preprocessed}"
**LANGUAGE CONTEXT:** ${languageHint || 'Auto-detect'}${contextInfo}
**EXTRACTED ENTITIES:** ${JSON.stringify(entities)}

**YOUR TASK:**
1. Understand the user's intent with fuzzy matching (ignore small spelling errors)
2. Extract key information (product name, price range, quantity)
3. Generate a natural response in the SAME language as the input

**SPECIAL HANDLING:**
- If input contains "current_product" and context exists, use context.productName
- If price range is in entities, include it in the search query
- Handle variations: "cart"/"card", "phone"/"fone", "laptop"/"lappy"

**VALID ACTIONS:**
- **search**: Find products (include price filters if available)
- **add_to_cart**: Add product to cart
- **remove_from_cart**: Remove product from cart
- **add_to_wishlist**: Save product for later
- **navigate**: Go to page (cart, home, orders, wishlist, profile)
- **checkout**: Proceed to payment
- **set_theme**: Change theme (dark/light)
- **change_language**: Switch app language (en, hi, kn, ta, te, ml)
- **unknown**: Cannot understand

**OUTPUT FORMAT (JSON ONLY):**
{
  "action": "one_of_valid_actions",
  "item": "product_name_or_page",
  "entities": {
    "product": "extracted product name",
    "minPrice": number or null,
    "maxPrice": number or null,
    "quantity": number or null
  },
  "responseText": "Natural response in USER'S LANGUAGE",
  "language": "detected_language_code (en-IN, hi-IN, kn-IN)",
  "confidence": 0.0-1.0
}

**EXAMPLES:**
Input: "show me phones under 5000"
Output: {"action":"search","item":"phones","entities":{"product":"phones","maxPrice":5000},"responseText":"Searching for phones under ₹5000","language":"en-IN","confidence":0.95}

Input: "add current_product to cart" (with context: {productName: "iPhone 15"})
Output: {"action":"add_to_cart","item":"iPhone 15","entities":{"product":"iPhone 15"},"responseText":"Adding iPhone 15 to cart","language":"en-IN","confidence":0.98}

Input: "कार्ट खोलो"
Output: {"action":"navigate","item":"cart","entities":{},"responseText":"कार्ट खोल रहे हैं","language":"hi-IN","confidence":1.0}

Input: "switch to kannada"
Output: {"action":"change_language","item":"kn","entities":{},"responseText":"Switching to Kannada","language":"en-IN","confidence":0.95}

Input: "ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ"
Output: {"action":"change_language","item":"kn","entities":{},"responseText":"ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ","language":"kn-IN","confidence":0.95}

**NOW PROCESS THE USER INPUT AND RESPOND WITH JSON ONLY:**`;

            const response = await ollama.chat({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                format: 'json',
                stream: false,
            });

            const content = response.message.content;
            logger.info(`Ollama Response: ${content}`);

            const parsed = JSON.parse(content);

            // Merge extracted entities with Ollama's entities
            const mergedEntities = {
                ...entities,
                ...parsed.entities,
            };
            
            // If context has productId, add it to entities
            if (this.conversationContext?.productId) {
                mergedEntities.productId = this.conversationContext.productId;
            }

            return {
                success: true,
                transcript: text,
                action: parsed.action || 'unknown',
                item: parsed.item || '',
                entities: mergedEntities,
                responseText: parsed.responseText || "I didn't understand that.",
                language: parsed.language || 'auto',
                confidence: parsed.confidence || 0.5,
                timestamp: new Date().toISOString()
            };

        } catch (error: any) {
            logger.error('Ollama Error:', error);
            
            if (error.message.includes('not found')) {
                logger.warn(`Model '${this.model}' not found. Please run: ollama pull ${this.model}`);
            }
            
            return {
                success: false,
                transcript: text,
                action: 'unknown',
                item: '',
                error: `Ollama Error: ${error.message}`,
                timestamp: new Date().toISOString()
            };
        }
    }
}

export const ollamaService = new OllamaService();
export const processTextCommand = (text: string, languageHint?: string) => ollamaService.processTextCommand(text, languageHint);
export const setContext = (context: any) => ollamaService.setContext(context);
