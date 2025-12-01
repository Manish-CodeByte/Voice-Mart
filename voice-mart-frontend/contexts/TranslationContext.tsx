'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translate: (text: string) => Promise<string>;
  cache: Record<string, string>;
  addToCache: (text: string, translated: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('en');
  const [cache, setCache] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language');
    if (savedLang) setLanguage(savedLang);
  }, []);

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const addToCache = (text: string, translated: string) => {
    setCache(prev => ({ ...prev, [`${language}:${text}`]: translated }));
  };

  const translate = async (text: string): Promise<string> => {
    if (language === 'en') return text;
    
    const cacheKey = `${language}:${text}`;
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const response = await api.translateText(text, language) as any;
      if (response.success && response.text) {
        addToCache(text, response.text);
        return response.text;
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
    return text;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, translate, cache, addToCache }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
