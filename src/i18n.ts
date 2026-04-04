import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';

// Ensure all nested top-level objects (auth, home, etc.) are also registered as namespaces
// so that t('auth:toast.invalid') seamlessly maps to enTranslation.auth... without breaking components
const buildResources = (translationFile: any) => {
  const res: any = { translation: translationFile };
  Object.keys(translationFile).forEach(key => {
    res[key] = translationFile[key];
  });
  return res;
};

const resources = {
  en: buildResources(enTranslation),
  es: buildResources(esTranslation),
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
