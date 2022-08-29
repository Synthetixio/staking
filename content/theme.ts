import { ChakraTheme } from '@chakra-ui/react';
import { theme as chakraTheme } from '@synthetixio/v3-theme';

export const stakingTheme: Partial<ChakraTheme> = {
  ...chakraTheme,
  components: {
    Button: {
      baseStyle: {
        fontWeight: 700,
        borderRadius: 'base',
        color: 'black',
        fontFamily: 'heading',
        lineHeight: '20px',
      },
      variants: {
        connect: {
          bgGradient: chakraTheme.gradients['green-cyan']['500'],
          _hover: {
            bgGradient: chakraTheme.gradients['green-cyan']['600'],
          },
          _active: {
            bgGradient: chakraTheme.gradients['green-cyan']['700'],
          },
        },
      },
    },
    Text: {},
  },
  styles: {
    global: {
      body: {
        bg: 'navy.900',
        color: 'white',
      },
    },
  },
};
