import React, { FC, PropsWithChildren } from 'react';
import { stakingTheme } from '../content/theme';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const ChakraProviderWithTheme: FC<PropsWithChildren> = ({ children }) => {
  return <ChakraProvider theme={extendTheme(stakingTheme)}>{children}</ChakraProvider>;
};

export default ChakraProviderWithTheme;
