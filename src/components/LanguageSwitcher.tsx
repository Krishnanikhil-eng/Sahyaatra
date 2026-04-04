import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Persist language exactly as requested, though i18next-browser-languagedetector
    // will also do this using 'i18nextLng' by default since we added 'localStorage' cache.
    // For exact match to user requirement ("Persist selected language via localStorage"):
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 text-sm rounded ${
          i18n.language === 'en' || i18n.language?.startsWith('en')
            ? 'bg-blue-600 text-white font-medium'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('es')}
        className={`px-2 py-1 text-sm rounded ${
          i18n.language === 'es' || i18n.language?.startsWith('es')
            ? 'bg-blue-600 text-white font-medium'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        ES
      </button>
    </div>
  );
}
