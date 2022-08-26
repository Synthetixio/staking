import { ChakraTheme } from '@chakra-ui/react';
import { theme as chakraTheme } from '@synthetixio/v3-theme';

export const stakingTheme: Partial<ChakraTheme> = {
  ...chakraTheme,
  components: {
    Button: {
      variants: {
        solid: (_props) => ({
          _hover: {
            bgGradient: chakraTheme.gradients.cyan,
          },
        }),
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: chakraTheme.colors.navy['900'],
        color: chakraTheme.colors.white,
      },
    },
  },
};
