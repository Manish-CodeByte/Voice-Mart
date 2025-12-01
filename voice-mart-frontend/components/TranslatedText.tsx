'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

interface TranslatedTextProps {
  text: string;
  className?: string;
}

export default function TranslatedText({ text, className }: TranslatedTextProps) {
  const { language, translate, cache } = useTranslation();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let isMounted = true;

    if (language === 'en') {
      setTranslated(text);
      return;
    }

    const cacheKey = `${language}:${text}`;
    if (cache[cacheKey]) {
      setTranslated(cache[cacheKey]);
    } else {
      translate(text).then(res => {
        if (isMounted) setTranslated(res);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [text, language, cache, translate]);

  return <span className={className}>{translated}</span>;
}
