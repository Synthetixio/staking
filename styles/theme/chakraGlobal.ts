export const globalStyles = {
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
  'scrollbar-face-color': 'pink.400',
  'scrollbar-base-color': 'pink.400',
  'scrollbar-3dlight-color': 'pink.400',
  'scrollbar-highlight-color': 'pink.400',
  'scrollbar-shadow-color': 'pink.400',
  'scrollbar-dark-shadow-color': 'pink.400',
  'scrollbar-track-color': 'blue.900',
  'scrollbar-arrow-color': 'blue.900',
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
};
