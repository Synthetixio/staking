import { ChakraTheme, ComponentMultiStyleConfig } from '@chakra-ui/react';
import { theme as chakraTheme } from '@synthetixio/v3-theme';

const Progress: ComponentMultiStyleConfig = {
  parts: ['filledTrack', 'track'],
  baseStyle: {
    track: {
      overflow: 'unset',
      bg: 'whiteAlpha.100',
    },
  },
  variants: {
    error: (props) => ({
      filledTrack: {
        boxShadow: `0px 0px 15px ${props.theme.colors.error}`,
        bg: 'error',
      },
    }),
    warning: (props) => ({
      filledTrack: {
        boxShadow: `0px 0px 15px ${props.theme.colors.warning}`,
        bg: 'warning',
      },
    }),
    success: (props) => ({
      filledTrack: {
        bg: 'success',
        boxShadow: `0px 0px 15px ${props.theme.colors.success}`,
      },
    }),
  },
};
export const stakingTheme: Partial<ChakraTheme> = {
  ...chakraTheme,
  colors: {
    ...chakraTheme.colors,
    error: chakraTheme.colors.red['400'],
    success: chakraTheme.colors.green['500'],
    warning: chakraTheme.colors.orange['500'],
  },
  components: {
    ...chakraTheme.components,
    Progress,
  },
  styles: {
    global: {
      body: {
        bg: 'navy.900',
        color: 'white',
      },
      '::-webkit-scrollbar': {
        width: '8px',
        height: '3px',
      },
      '::-webkit-scrollbar-thumb': {
        height: '50px',
        borderRadius: '3px',
        bg: 'cyan.500',
      },
      scrollbarFaceColor: 'pink.400',
      scrollbarBaseColor: 'pink.400',
      scrollbar3dlightColor: 'pink.400',
      scrollbarHighlightColor: 'pink.400',
      scrollbarShadowColor: 'pink.400',
      scrollbarDarkShadowColor: 'pink.400',
      scrollbarTrackColor: 'blue.900',
      scrollbarArrowColor: 'blue.900',
      '::-webkit-scrollbar-button': { bg: 'blue.900' },
      '::-webkit-scrollbar-track-piece': { bg: 'blue.900' },
      '::-webkit-resizer': { bg: 'cyan.500' },
      '::-webkit-scrollbar-track': { bg: 'pink.400' },
      '::-webkit-scrollbar-corner': { bg: 'pink.400' },

      // TODO: Update this once styled components removed
      '@media screen and (max-width: 768px)': {
        '.table-header-cell, .table-body-cell': {
          whiteSpace: 'nowrap',
        },
      },
    },
  },
};
