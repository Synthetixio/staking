import { FC } from 'react';
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
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { DEFAULT_REQUEST_REFRESH_INTERVAL } from 'constants/defaults';
import { ReactQueryDevtools } from 'react-query-devtools';

import SystemStatus from 'sections/shared/SystemStatus';
import MobileUnsupported from 'sections/shared/MobileUnsupported';

import 'styles/main.css';
import '@reach/dialog/styles.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'tippy.js/dist/tippy.css';

import '../i18n';

const queryCache = new QueryCache({
	defaultConfig: {
		queries: {
			refetchInterval: DEFAULT_REQUEST_REFRESH_INTERVAL,
		},
	},
});

// trigger deploy - going live 22 Dec 2020!

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
					<WithAppContainers>
						<MediaContextProvider>
							<ReactQueryCacheProvider queryCache={queryCache}>
								<Layout>
									<MobileUnsupported>
										<SystemStatus>
											<AppLayout>
												<Component {...pageProps} />
											</AppLayout>
										</SystemStatus>
									</MobileUnsupported>
								</Layout>
								<ReactQueryDevtools />
							</ReactQueryCacheProvider>
						</MediaContextProvider>
					</WithAppContainers>
				</RecoilRoot>
			</ThemeProvider>
		</>
	);
};

export default App;
