import { stakingTheme } from '../content/theme';

export const parameters = {
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
