import { useTranslation } from 'react-i18next';

export function ExampleI18nComponent() {
  const { t } = useTranslation();

  return (
    <div className="p-4 border rounded-md shadow-sm">
      <h2 className="text-xl font-bold mb-2">{t('welcome')}</h2>
      <p className="text-gray-600 mb-4">{t('weather')}</p>
      
      {/* 
        This text relies on standard i18next translation keys mapping exactly
        to your src/locales/en/translation.json 
      */}
    </div>
  );
}
