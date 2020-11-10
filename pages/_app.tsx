import { FC } from 'react';
import { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';

import { ThemeProvider } from 'styled-components';

import WithStateContainers from 'containers';
import theme from 'styles/theme';

import 'styles/main.css';
import '../i18n';
import '@reach/dialog/styles.css';
import '@reach/tabs/styles.css';

import Layout from 'sections/shared/Layout';
import { MediaContextProvider } from 'styles/media';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { DEFAULT_REQUEST_REFRESH_INTERVAL } from 'constants/defaults';
import { ReactQueryDevtools } from 'react-query-devtools';

const queryCache = new QueryCache({
	defaultConfig: {
		queries: {
			refetchInterval: DEFAULT_REQUEST_REFRESH_INTERVAL,
		},
	},
});

const App: FC<AppProps> = ({ Component, pageProps }) => {
	return (
		<MediaContextProvider>
			<RecoilRoot>
				<ThemeProvider theme={theme}>
					<WithStateContainers>
						<ReactQueryCacheProvider queryCache={queryCache}>
							<Layout>
								<Component {...pageProps} />
							</Layout>
							<ReactQueryDevtools />
						</ReactQueryCacheProvider>
					</WithStateContainers>
				</ThemeProvider>
			</RecoilRoot>
		</MediaContextProvider>
	);
};

export default App;
