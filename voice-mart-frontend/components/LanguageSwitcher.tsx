'use client';

import * as React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'tcy', name: 'ತುಳು' }, // Tulu might not be supported by Google Translate API directly, might fallback to Kannada or English
  { code: 'hi', name: 'हिंदी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ml', name: 'മലയാളം' },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { language, setLanguage } = useTranslation();

  React.useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
      >
        <Globe className="h-5 w-5 text-foreground/70" />
        <span className="text-sm font-medium hidden sm:inline-block">
          {languages.find(l => l.code === language)?.name || 'Language'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 rounded-lg border border-border bg-popover shadow-lg z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-sm text-left hover:bg-accent transition-colors ${
                language === lang.code ? 'bg-accent font-medium' : ''
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
