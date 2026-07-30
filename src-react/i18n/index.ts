import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUS from '../../src/i18n/messages/en-US';
import zhCN from '../../src/i18n/messages/zh-CN';
import { resolveInitialLocale } from './preferences';

void i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    'en-US': { translation: enUS },
  },
  lng: resolveInitialLocale(localStorage.getItem('sing-sub.locale'), navigator.language),
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false },
});

document.documentElement.lang = i18n.language;
i18n.on('languageChanged', (locale) => {
  document.documentElement.lang = locale;
  localStorage.setItem('sing-sub.locale', locale);
});

export default i18n;
