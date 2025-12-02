'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

import { getFallbackTranslation } from '@/lib/translations';

type TransProps = {
  children: string; // The original English text
  onTranslated?: (translatedText: string) => void;
};

export const Trans = ({ children, onTranslated }: TransProps) => {
  const { lang } = useLanguage();
  // Initialize with fallback if available, otherwise original text
  const [translated, setTranslated] = useState(() => {
    if (lang === 'en') return children;
    return getFallbackTranslation(children, lang) || children;
  });

  useEffect(() => {
    // v2: Invalidate old cache (especially for Tulu fixes)
    const cacheKey = `v2:${lang}:${children}`;
    const cachedTranslation = sessionStorage.getItem(cacheKey);

    const updateText = (text: string) => {
        setTranslated(text);
        if (onTranslated) {
            onTranslated(text);
        }
    };

    if (lang === 'en') {
      updateText(children);
      return;
    }
    
    if (cachedTranslation) {
      updateText(cachedTranslation);
      return;
    }

    const fetchTranslation = async () => {
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: children, to: lang }),
        });

        if (!res.ok) throw new Error('Translation API request failed');

        const data = await res.json();
        updateText(data.translatedText);
        sessionStorage.setItem(cacheKey, data.translatedText);

      } catch (error) {
        console.error('Translation failed:', error);
        updateText(children); // Fallback to original text
      }
    };

    fetchTranslation();
  }, [children, lang, onTranslated]); 

  return <>{translated}</>;
};
