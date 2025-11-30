'use client';

import * as React from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'tcy', name: 'ತುಳು' },
  { code: 'hi', name: 'हिंदी' },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentLang, setCurrentLang] = React.useState('en');

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
          {languages.find(l => l.code === currentLang)?.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 rounded-lg border border-border bg-popover shadow-lg z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setCurrentLang(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-sm text-left hover:bg-accent transition-colors ${
                currentLang === lang.code ? 'bg-accent font-medium' : ''
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
