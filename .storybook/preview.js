import { stakingTheme } from '../content/theme';
import i18n from './i18next.js';

export const parameters = {
  i18n,
  locale: 'en',
  locales: {
    en: 'English',
  },
  chakra: {
    theme: stakingTheme,
  },
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
