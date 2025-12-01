import { NextRequest, NextResponse } from 'next/server';
import { translate } from '@vitalets/google-translate-api';
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

    // 1. Check local fallback dictionary first (Optimization & Reliability)
    const fallback = getFallbackTranslation(text, to);
    if (fallback) {
        return NextResponse.json({ translatedText: fallback });
    }

    // 2. Call the translation API
    try {
        const result = await translate(text, { to });
        return NextResponse.json({ translatedText: result.text });
    } catch (apiError) {
        console.error('External API failed, returning original:', apiError);
        // 3. Fail gracefully by returning original text
        // We return 200 so the UI doesn't break, but we could add a flag
        return NextResponse.json({ translatedText: text, isFallback: true });
    }

  } catch (err: any) {
    console.error('Translation route error:', err);
    return NextResponse.json({ translatedText: text }, { status: 500 });
  }
}
