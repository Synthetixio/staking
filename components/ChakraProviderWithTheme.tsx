import React, { FC } from 'react';
import { stakingTheme } from '../content/theme';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const ChakraProviderWithTheme: FC = ({ children }) => {
  return <ChakraProvider theme={extendTheme(stakingTheme)}>{children}</ChakraProvider>;
};

export default ChakraProviderWithTheme;
