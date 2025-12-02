import logger from '../utils/logger.js';

export interface VoiceCommandResult {
    success: boolean;
    transcript: string;
    action: string;
    item: string;
    responseText?: string;
    audioResponse?: string;
    language?: string;
    error?: string;
    timestamp?: string;
}

/**
 * Detect language from text
 */
function detectLanguage(text: string): string {
    if (/[\u0900-\u097F]/.test(text)) return 'hi-IN'; // Hindi (Devanagari)
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN'; // Kannada
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN'; // Tamil
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN'; // Telugu
    return 'en-IN'; // English (default)
}

/**
 * Smart Local NLP - No external API needed
 * Comprehensive multilingual pattern matching
 */
export async function processTextCommand(text: string): Promise<VoiceCommandResult> {
    const lower = text.toLowerCase().trim();
    const lang = detectLanguage(text);
    
    logger.info(`🧠 Local NLP Processing: "${text}" (lang: ${lang})`);

    let action = 'unknown';
    let item = '';
    let responseText = '';

    // ===== 1. CHECKOUT =====
    if (
        lower.match(/\b(checkout|check\s*out)\b/) ||
        lower.includes('ಚೆಕ್') || lower.includes('ಚೆಕ್‌ಔಟ್') ||
        lower.includes('चेकआउट') || lower.includes('खरीद')
    ) {
        action = 'checkout';
        responseText = lang === 'kn-IN' ? 'ಚೆಕ್‌ಔಟ್‌ಗೆ ಹೋಗುತ್ತಿದ್ದೇವೆ.' :
                       lang === 'hi-IN' ? 'चेकआउट पर जा रहे हैं।' :
                       'Proceeding to checkout.';
    }

    // ===== 2. CART =====
    else if (
        lower.match(/\b(cart|basket)\b/) ||
        lower.includes('ಕಾರ್ಟ್') || lower.includes('ಕಾರ್ಟು') ||
        lower.includes('कार्ट') || lower.includes('टोकरी')
    ) {
        action = 'navigate';
        item = 'cart';
        responseText = lang === 'kn-IN' ? 'ಕಾರ್ಟ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.' :
                       lang === 'hi-IN' ? 'कार्ट खोल रहे हैं।' :
                       'Opening your cart.';
    }

    // ===== 3. HOME =====
    else if (
        lower.match(/\b(home|main\s*page)\b/) ||
        lower.includes('ಮುಖಪುಟ') || lower.includes('ಹೋಮ್') ||
        lower.includes('होम') || lower.includes('मुख्य')
    ) {
        action = 'navigate';
        item = 'home';
        responseText = lang === 'kn-IN' ? 'ಮುಖಪುಟಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇವೆ.' :
                       lang === 'hi-IN' ? 'होम पेज पर जा रहे हैं।' :
                       'Going to home page.';
    }

    // ===== 4. ORDERS =====
    else if (
        lower.match(/\b(order|orders|my\s*order)\b/) ||
        lower.includes('ಆರ್ಡರ್') || lower.includes('ಆದೇಶ') ||
        lower.includes('ऑर्डर') || lower.includes('आदेश')
    ) {
        action = 'navigate';
        item = 'orders';
        responseText = lang === 'kn-IN' ? 'ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇವೆ.' :
                       lang === 'hi-IN' ? 'आपके ऑर्डर दिखा रहे हैं।' :
                       'Showing your orders.';
    }

    // ===== 5. WISHLIST =====
    else if (
        lower.match(/\b(wishlist|wish\s*list|favorites)\b/) ||
        lower.includes('ವಿಶ್') || lower.includes('ಇಷ್ಟ') ||
        lower.includes('विश') || lower.includes('पसंद')
    ) {
        action = 'navigate';
        item = 'wishlist';
        responseText = lang === 'kn-IN' ? 'ವಿಶ್‌ಲಿಸ್ಟ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.' :
                       lang === 'hi-IN' ? 'विशलिस्ट खोल रहे हैं।' :
                       'Opening your wishlist.';
    }

    // ===== 6. DARK MODE =====
    else if (
        lower.match(/\b(dark|night)\s*(mode|theme)\b/) ||
        lower.includes('ಡಾರ್ಕ್') || lower.includes('ಕತ್ತಲೆ') ||
        lower.includes('डार्क') || lower.includes('अंधेरा')
    ) {
        action = 'set_theme';
        item = 'dark';
        responseText = lang === 'kn-IN' ? 'ಡಾರ್ಕ್ ಮೋಡ್‌ಗೆ ಬದಲಾಯಿಸುತ್ತಿದ್ದೇವೆ.' :
                       lang === 'hi-IN' ? 'डार्क मोड में बदल रहे हैं।' :
                       'Switching to dark mode.';
    }

    // ===== 7. LIGHT MODE =====
    else if (
        lower.match(/\b(light|day)\s*(mode|theme)\b/) ||
        lower.includes('ಲೈಟ್') || lower.includes('ಬೆಳಕು') ||
        lower.includes('लाइट') || lower.includes('उजाला')
    ) {
        action = 'set_theme';
        item = 'light';
        responseText = lang === 'kn-IN' ? 'ಲೈಟ್ ಮೋಡ್‌ಗೆ ಬದಲಾಯಿಸುತ್ತಿದ್ದೇವೆ.' :
                       lang === 'hi-IN' ? 'लाइट मोड में बदल रहे हैं।' :
                       'Switching to light mode.';
    }

    // ===== 8. SEARCH =====
    else if (
        lower.match(/\b(show|find|search|looking\s*for|get|want)\b/) ||
        lower.includes('ತೋರಿಸು') || lower.includes('ಹುಡುಕು') || lower.includes('ಕೊಡು') ||
        lower.includes('दिखाओ') || lower.includes('खोज') || lower.includes('ढूंढो')
    ) {
        action = 'search';
        
        // Extract item from patterns
        const patterns = [
            /(?:show|find|search|looking\s*for|get|want|ತೋರಿಸು|ಹುಡುಕು|ಕೊಡು|दिखाओ|खोज|ढूंढो)\s+(.+)/i,
            /(.+)\s+(?:please|pls|ದಯವಿಟ್ಟು|कृपया)$/i,
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                item = match[1].trim();
                break;
            }
        }
        
        if (!item) item = text; // Use full text as search
        
        responseText = lang === 'kn-IN' ? `${item} ಹುಡುಕುತ್ತಿದ್ದೇವೆ.` :
                       lang === 'hi-IN' ? `${item} खोज रहे हैं।` :
                       `Searching for ${item}.`;
    }

    // ===== 9. UNKNOWN =====
    else {
        action = 'unknown';
        responseText = lang === 'kn-IN' ? 'ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ.' :
                       lang === 'hi-IN' ? 'मुझे समझ नहीं आया। कृपया फिर से कहें।' :
                       "I'm sorry, I didn't understand that.";
    }

    logger.info(`✅ Local NLP Result: action="${action}", item="${item}", lang="${lang}"`);

    return {
        success: true,
        transcript: text,
        action,
        item,
        responseText,
        language: lang,
        timestamp: new Date().toISOString()
    };
}
