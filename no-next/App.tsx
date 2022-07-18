import React from 'react';
import { useEffect } from 'react';
import Head from 'next/head';
import { RecoilRoot } from 'recoil';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from 'styled-components';

import WithAppContainers from 'containers';
import theme from 'styles/theme';
import Layout from 'sections/shared/Layout';
import { MediaContextProvider } from 'styles/media';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { DEFAULT_REQUEST_REFRESH_INTERVAL } from 'constants/defaults';

import { SynthetixQueryContextProvider, createQueryContext } from '@synthetixio/queries';

import SystemStatus from 'sections/shared/SystemStatus';

import '../i18n';
import Connector from 'containers/Connector';

import Routes from './Routes';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchInterval: DEFAULT_REQUEST_REFRESH_INTERVAL,
			refetchOnWindowFocus: false,
		},
	},
});

function InnerApp() {
	const { provider, signer, network, L1DefaultProvider } = Connector.useContainer();

	useEffect(() => {
		try {
			document.querySelector('#global-loader')?.remove();
		} catch (_e) {}
	}, []);

	return (
		<>
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
						<Routes />
					</SystemStatus>
				</Layout>
				<ReactQueryDevtools />
			</SynthetixQueryContextProvider>
		</>
	);
}

function App() {
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
								<InnerApp />
							</MediaContextProvider>
						</WithAppContainers>
					</QueryClientProvider>
				</RecoilRoot>
			</ThemeProvider>
		</>
	);
}

export default App;
