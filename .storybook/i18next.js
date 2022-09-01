import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';

const ns = ['common'];
const supportedLngs = ['en'];
const resources = ns.reduce((acc, n) => {
  supportedLngs.forEach((lng) => {
    if (!acc[lng]) acc[lng] = {};
    acc[lng] = {
      ...acc[lng],
      [n]: require(`../translations/${lng}.json`),
    };
  });
  return acc;
}, {});

i18n.use(initReactI18next).init({
  //debug: true,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  supportedLngs,
  resources,
});

export default i18n;
