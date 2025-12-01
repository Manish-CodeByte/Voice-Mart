'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type LanguageContextType = {
  lang: string;
  setLang: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState('en');

  // Read from localStorage on mount
  useEffect(() => {
    const storedLang = localStorage.getItem('lang');
    if (storedLang) {
      setLangState(storedLang);
    }
  }, []);

  // Save to localStorage on change
  const setLang = (newLang: string) => {
    localStorage.setItem('lang', newLang);
    setLangState(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
