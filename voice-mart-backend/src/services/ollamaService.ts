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
    
    // Special case: "card" should only be converted to "cart" if NOT followed by "payment"
    // This prevents "card payment" from becoming "cart payment"
    if (!processed.includes('card payment') && !processed.includes('card method')) {
        processed = processed.replace(/\bcard\b/gi, 'cart');
    }
    
    // Replace phonetic errors
    Object.entries(phoneticMap).forEach(([wrong, correct]) => {
        const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
        processed = processed.replace(regex, correct);
    });
    
    // Normalize common phrases (including STT mishearings)
    processed = processed.replace(/\b(this|dis|dat|the|current)\s+(item|product|one)\b/gi, 'current_product');
    processed = processed.replace(/\b(that|dis)\s+(one|item)\b/gi, 'current_product');
    processed = processed.replace(/\bthis\s+one\b/gi, 'current_product');
    
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
     * Call Hugging Face Inference API
     */
    private async callHuggingFace(prompt: string): Promise<any> {
        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) {
            throw new Error('HUGGINGFACE_API_KEY not found');
        }

        const model = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
        const url = `https://api-inference.huggingface.co/models/${model}`;

        logger.info(`Calling Hugging Face API: ${model}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    return_full_text: false,
                    max_new_tokens: 500,
                    temperature: 0.1,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Hugging Face API error: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        // Hugging Face returns an array of objects with 'generated_text'
        let content = '';
        if (Array.isArray(result) && result.length > 0) {
            content = result[0].generated_text;
        } else if (typeof result === 'object' && result.generated_text) {
            content = result.generated_text;
        } else {
            logger.warn('Unexpected Hugging Face response format:', result);
            content = JSON.stringify(result);
        }

        // Clean up response (sometimes includes the prompt or extra text)
        content = content.trim();
        // Extract JSON if wrapped in code blocks
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            content = jsonMatch[1];
        }

        return { message: { content } };
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
            
            const provider = process.env.LLM_PROVIDER || 'ollama';
            logger.info(`Processing: "${text}" (Provider: ${provider}, Model: ${this.model}, Hint: ${languageHint})`);
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
3. **CRITICAL:** If the user speaks in a non-English language (Hindi, Kannada, etc.):
   - Translate the item field to ENGLISH (e.g., "phone" not "ಫೋನ್")
   - Translate entities.product to ENGLISH
   - Keep responseText in the USER'S language
4. Generate a natural response in the SAME language as the input

**SPECIAL HANDLING:**
- If input contains "current_product" and context exists, use context.productName
- **IMPORTANT:** If user mentions a specific product name (e.g., "MacBook", "iPhone"), use that name, NOT the context
- Only use context when user says "this", "current", or similar pronouns
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
- **select_payment**: Choose payment method (cod, card, upi, netbanking)
- **cancel_order**: Cancel an order (use order ID from context or item)
- **unknown**: Cannot understand

**OUTPUT FORMAT (JSON ONLY):**
{
  "action": "one_of_valid_actions",
  "item": "product_name_or_page (ALWAYS IN ENGLISH)",
  "entities": {
    "product": "extracted product name (ALWAYS IN ENGLISH)",
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

Input: "ಫೋನ್ ತೋರಿಸಿ" (Show phone)
Output: {"action":"search","item":"phone","entities":{"product":"phone"},"responseText":"ಫೋನ್ಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ","language":"kn-IN","confidence":0.95}

Input: "go to shop"
Output: {"action":"navigate","item":"shop","entities":{},"responseText":"Navigating to shop","language":"en-IN","confidence":0.99}

Input: "cart ge hogi" (Go to cart)
Output: {"action":"navigate","item":"cart","entities":{},"responseText":"ಕಾರ್ಟ್ಗೆ ಹೋಗಲಾಗುತ್ತಿದೆ","language":"kn-IN","confidence":0.99}

Input: "orders ge hogi" (Go to orders)
Output: {"action":"navigate","item":"orders","entities":{},"responseText":"ನಿಮ್ಮ ಆರ್ಡರ್ಗಳನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ","language":"kn-IN","confidence":0.99}

Input: "switch to light mode"
Output: {"action":"set_theme","item":"light","entities":{},"responseText":"Switching to light mode","language":"en-IN","confidence":0.99}

Input: "kannada kke badalisi" (Change to Kannada)
Output: {"action":"change_language","item":"kn","entities":{},"responseText":"ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ","language":"kn-IN","confidence":0.99}

Input: "change language to english" (spoken in any language)
Output: {"action":"change_language","item":"en","entities":{},"responseText":"Switching to English","language":"en-IN","confidence":0.99}

Input: "add current_product to cart" (with context: {productName: "iPhone 15"})
Output: {"action":"add_to_cart","item":"iPhone 15","entities":{"product":"iPhone 15"},"responseText":"Adding iPhone 15 to cart","language":"en-IN","confidence":0.98}

Input: "cart kholo"
Output: {"action":"navigate","item":"cart","entities":{},"responseText":"Opening cart","language":"hi-IN","confidence":1.0}

Input: "pay with cash on delivery"
Output: {"action":"select_payment","item":"cod","entities":{},"responseText":"Selected Cash on Delivery","language":"en-IN","confidence":0.98}

Input: "cancel latest order"
Output: {"action":"cancel_order","item":"latest_order","entities":{},"responseText":"Cancelling latest order","language":"en-IN","confidence":0.98}

**NOW PROCESS THE USER INPUT AND RESPOND WITH JSON ONLY:**`;

            let response;
            
            if (provider === 'huggingface') {
                response = await this.callHuggingFace(prompt);
            } else {
                try {
                    // Default to Ollama
                    response = await ollama.chat({
                        model: this.model,
                        messages: [{ role: 'user', content: prompt }],
                        format: 'json',
                        stream: false,
                    });
                } catch (ollamaError: any) {
                    // If Ollama fails (e.g., CUDA error) and we have HF key, try fallback
                    if (process.env.HUGGINGFACE_API_KEY) {
                        logger.warn(`Ollama failed (${ollamaError.message}), falling back to Hugging Face...`);
                        response = await this.callHuggingFace(prompt);
                    } else {
                        throw ollamaError;
                    }
                }
            }

            const content = response.message.content;
            logger.info(`LLM Response: ${content}`);

            let parsed;
            try {
                parsed = JSON.parse(content);
            } catch (e) {
                // Try to extract JSON if it's mixed with text
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Failed to parse JSON response');
                }
            }

            // Merge extracted entities with LLM's entities
            const mergedEntities = {
                ...entities,
                ...parsed.entities,
            };
            
            // Only add productId from context if user said "this item" or "current product"
            // Don't override when user mentions a specific product name
            if (this.conversationContext?.productId && preprocessed.includes('current_product')) {
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
            logger.error('LLM Error:', error);
            
            if (error.message.includes('not found') && !process.env.LLM_PROVIDER) {
                logger.warn(`Model '${this.model}' not found. Please run: ollama pull ${this.model}`);
            }
            
            return {
                success: false,
                transcript: text,
                action: 'unknown',
                item: '',
                error: `LLM Error: ${error.message}`,
                timestamp: new Date().toISOString()
            };
        }
    }
}

export const ollamaService = new OllamaService();
export const processTextCommand = (text: string, languageHint?: string) => ollamaService.processTextCommand(text, languageHint);
export const setContext = (context: any) => ollamaService.setContext(context);
