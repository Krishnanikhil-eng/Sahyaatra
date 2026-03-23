import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center space-x-1.5">
      <Globe className="w-4 h-4 text-gray-500" />
      <select
        id="language-switcher"
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
