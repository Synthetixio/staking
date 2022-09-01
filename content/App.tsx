import React, { FC, Suspense, useEffect, PropsWithChildren } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { RecoilRoot } from 'recoil';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from 'styled-components';

import WithAppContainers from 'containers';
import theme from 'styles/theme';

import Layout from 'sections/shared/Layout';
import AppLayout from 'sections/shared/Layout/AppLayout';
import { MediaContextProvider } from 'styles/media';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { DEFAULT_REQUEST_REFRESH_INTERVAL } from 'constants/defaults';

import { SynthetixQueryContextProvider, createQueryContext } from '@synthetixio/queries';

import SystemStatus from 'sections/shared/SystemStatus';

import '../i18n';
import Connector from 'containers/Connector';
import { isSupportedNetworkId } from '../utils/network';
import useLocalStorage from '../hooks/useLocalStorage';
import GlobalLoader from '../components/GlobalLoader';
import { LOCAL_STORAGE_KEYS } from '../constants/storage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: DEFAULT_REQUEST_REFRESH_INTERVAL,
      refetchOnWindowFocus: false,
    },
  },
});

const InnerApp: FC<AppProps> = ({ Component, pageProps }) => {
  const { provider, signer, network, L1DefaultProvider, synthetixjs } = Connector.useContainer();

  useEffect(() => {
    try {
      document.querySelector('#global-loader')?.remove();
    } catch (_e) {}
  }, []);
  const networkId = network?.id ? Number(network?.id) : -1;
  return (
    <>
      <SynthetixQueryContextProvider
        value={
          provider && isSupportedNetworkId(networkId) && synthetixjs
            ? createQueryContext({
                provider: provider,
                signer: signer || undefined,
                networkId,
                synthetixjs,
              })
            : createQueryContext({
                networkId: 1,
                provider: L1DefaultProvider,
                synthetixjs: null,
              })
        }
      >
        <Layout>
          <SystemStatus>
            <AppLayout>
              <Component {...pageProps} />
            </AppLayout>
          </SystemStatus>
        </Layout>
        <ReactQueryDevtools />
      </SynthetixQueryContextProvider>
    </>
  );
};
const ChakraProviderWithTheme: FC<PropsWithChildren> = React.lazy(
  () =>
    import(
      /* webpackChunkName: "ChakraProviderWithTheme" */
      '../components/ChakraProviderWithTheme'
    )
);

const LazyChakraProvider: FC<PropsWithChildren<{ enabled: boolean }>> = ({ enabled, children }) => {
  if (!enabled) return <>{children}</>;

  return (
    <Suspense fallback={<GlobalLoader />}>
      <ChakraProviderWithTheme>{children}</ChakraProviderWithTheme>
    </Suspense>
  );
};
const App: FC<AppProps> = (props) => {
  const { t } = useTranslation();
  const [STAKING_V2_ENABLED] = useLocalStorage(LOCAL_STORAGE_KEYS.STAKING_V2_ENABLED, false);
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={t('meta.description')} />
        {/* open graph */}
        <meta property="og:url" content="https://staking.synthetix.io/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t('meta.og.title')} />
        <meta property="og:description" content={t('meta.description')} />
        <meta property="og:image" content="/images/staking-facebook.jpg" />
        <meta property="og:image:alt" content={t('meta.og.title')} />
        <meta property="og:site_name" content={t('meta.og.site-name')} />
        {/* twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@synthetix_io" />
        <meta name="twitter:creator" content="@synthetix_io" />
        <meta name="twitter:image" content="/images/staking-twitter.jpg" />
        <meta name="twitter:url" content="https://staking.synthetix.io" />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <LazyChakraProvider enabled={STAKING_V2_ENABLED}>
        <ThemeProvider theme={theme}>
          {/* @ts-ignore TODO: update recoil */}
          <RecoilRoot>
            {/* @ts-ignore TODO: update react-query */}
            <QueryClientProvider client={queryClient} contextSharing={true}>
              <WithAppContainers>
                {/* @ts-ignore TODO: update styled-media-query */}
                <MediaContextProvider>
                  <InnerApp {...props} />
                </MediaContextProvider>
              </WithAppContainers>
            </QueryClientProvider>
          </RecoilRoot>
        </ThemeProvider>
      </LazyChakraProvider>
    </>
  );
};

export default App;
