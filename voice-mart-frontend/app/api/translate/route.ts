import { NextRequest, NextResponse } from 'next/server';
import { translate } from 'google-translate-api-x';
import { getFallbackTranslation } from '@/lib/translations';

export async function POST(req: NextRequest) {
  let text = '';
  let to = '';
  
  try {
    const body = await req.json();
    text = body.text;
    to = body.to;

    if (!text || !to) {
        return NextResponse.json({ error: 'Missing "text" or "to" field' }, { status: 400 });
    }

    // 1. Special handling for Tulu (tcy) - Force fallback
    // Google Translate API often returns incorrect results for Tulu, so we use our manual dictionary.
    if (to === 'tcy') {
        const fallback = getFallbackTranslation(text, to);
        return NextResponse.json({ 
            translatedText: fallback || text, 
            isFallback: true 
        });
    }

    // 2. Call the translation API (Primary)
    try {
        // @ts-ignore
        const result = await translate(text, { to, client: 'gtx' });
        return NextResponse.json({ translatedText: result.text });
    } catch (apiError) {
        console.error('External API failed, attempting fallback:', apiError);
        
        // 2. Check local fallback dictionary if API fails
        const fallback = getFallbackTranslation(text, to);
        if (fallback) {
            return NextResponse.json({ translatedText: fallback, isFallback: true });
        }

        // 3. Fail gracefully by returning original text
        return NextResponse.json({ translatedText: text, isFallback: true });
    }

  } catch (err: any) {
    console.error('Translation route error:', err);
    return NextResponse.json({ translatedText: text }, { status: 500 });
  }
}
