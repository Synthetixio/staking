import React, { FC } from 'react';
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

import 'styles/main.css';
import '@reach/dialog/styles.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'tippy.js/dist/tippy.css';
import '../i18n';
import Connector from 'containers/Connector';

const InnerApp: FC<AppProps> = ({ Component, pageProps }) => {
	const { provider, network } = Connector.useContainer();

	return (
		<>
			<SynthetixQueryContextProvider
				value={
					provider && network
						? createQueryContext({
								provider: provider,
								networkId: network!.id,
						  })
						: createQueryContext({ networkId: null })
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

const App: FC<AppProps> = ({ Component, pageProps }) => {
	const { t } = useTranslation();

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
			<ThemeProvider theme={theme}>
				<RecoilRoot>
					<QueryClientProvider
						client={
							new QueryClient({
								defaultOptions: { queries: { refetchInterval: DEFAULT_REQUEST_REFRESH_INTERVAL } },
							})
						}
					>
						<WithAppContainers>
							<MediaContextProvider></MediaContextProvider>
						</WithAppContainers>
					</QueryClientProvider>
				</RecoilRoot>
			</ThemeProvider>
		</>
	);
};

export default App;
