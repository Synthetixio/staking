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
import { DEFAULT_SUBGRAPH_ENDPOINTS } from 'queries/subgraphEndpoints';
import { SynthetixQueryContext } from 'queries/context';
import type { QueryContext } from 'queries/context';

import SystemStatus from 'sections/shared/SystemStatus';

import '../i18n';
import Connector from 'containers/Connector';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchInterval: DEFAULT_REQUEST_REFRESH_INTERVAL,
			refetchOnWindowFocus: false,
		},
	},
});

const InnerApp: FC<AppProps> = ({ Component, pageProps }) => {
	const { provider, signer, network, L1DefaultProvider } = Connector.useContainer();

	const defaultQueryContext: QueryContext = {
		provider: L1DefaultProvider,
		signer: null,
		networkId: 1,
		subgraphEndpoints: DEFAULT_SUBGRAPH_ENDPOINTS[1],
	};
	const queryContext: QueryContext =
		provider && network?.id
			? {
					provider: provider,
					signer: signer ?? null,
					networkId: network.id,
					subgraphEndpoints: DEFAULT_SUBGRAPH_ENDPOINTS[1],
			  }
			: defaultQueryContext;

	return (
		<SynthetixQueryContext.Provider value={queryContext}>
			<SynthetixQueryContextProvider
				value={
					provider && network?.id
						? createQueryContext({
								provider: provider,
								signer: signer || undefined,
								networkId: network.id,
						  })
						: createQueryContext({
								networkId: 1,
								provider: L1DefaultProvider,
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
		</SynthetixQueryContext.Provider>
	);
};

const App: FC<AppProps> = (props) => {
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
				<link
					rel="stylesheet"
					type="text/css"
					href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.0/slick.min.css"
				/>
				<link
					rel="stylesheet"
					type="text/css"
					href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.0/slick-theme.min.css"
				/>

				{/* matomo */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
					  var _paq = window._paq = window._paq || [];
					  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
					  _paq.push(['trackPageView']);
					  _paq.push(['enableLinkTracking']);
					  (function() {
					    var u="https://analytics.synthetix.io/";
					    _paq.push(['setTrackerUrl', u+'matomo.php']);
					    _paq.push(['setSiteId', '3']);
					    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
					    g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
					  })();
				`,
					}}
				/>
			</Head>
			<ThemeProvider theme={theme}>
				<RecoilRoot>
					<QueryClientProvider client={queryClient} contextSharing={true}>
						<WithAppContainers>
							<MediaContextProvider>
								<InnerApp {...props} />
							</MediaContextProvider>
						</WithAppContainers>
					</QueryClientProvider>
				</RecoilRoot>
			</ThemeProvider>
		</>
	);
};

export default App;
