import type { FC, PropsWithChildren } from 'react';
import { createQueryContext, SynthetixQueryContextProvider } from '@synthetixio/queries';
import { ThemeProvider } from 'styled-components';
import theme from 'styles/theme';
import { QueryClient, QueryClientProvider } from 'react-query';

const ContextProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    /* @ts-ignore TODO: update react-query */
    <QueryClientProvider client={new QueryClient()} contextSharing={true}>
      <SynthetixQueryContextProvider
        value={createQueryContext({ networkId: 10, synthetixjs: null })}
      >
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </SynthetixQueryContextProvider>
    </QueryClientProvider>
  );
};

export default ContextProvider;
