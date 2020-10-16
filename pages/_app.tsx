import { FC } from 'react';
import { AppProps } from 'next/app';
import { useTranslation } from 'react-i18next';
import { RecoilRoot } from 'recoil';

import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';

import WithStateContainers from 'containers';
import theme, { muiTheme } from 'styles/theme';

import 'styles/fonts.css';
import '../i18n';

import Layout from 'sections/shared/Layout';
import { MediaContextProvider } from 'styles/media';

const App: FC<AppProps> = ({ Component, pageProps }) => {
	const { t } = useTranslation();
	return (
		<MediaContextProvider>
			<RecoilRoot>
				<SCThemeProvider theme={theme}>
					<MuiThemeProvider theme={muiTheme}>
						<WithStateContainers>
							<Layout>
								<Component {...pageProps} />
							</Layout>
						</WithStateContainers>
					</MuiThemeProvider>
				</SCThemeProvider>
			</RecoilRoot>
		</MediaContextProvider>
	);
};

export default App;
