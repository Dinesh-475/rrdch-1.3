import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// translation resources
import translationEN from './en/translation.json';
import translationKN from './kn/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  kn: {
    translation: translationKN
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
