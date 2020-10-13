import { FC } from 'react';
import { AppProps } from 'next/app';
import { useTranslation } from 'react-i18next';
import { RecoilRoot } from 'recoil';

import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';

import WithStateContainers from 'containers';
import { scTheme, muiTheme } from 'styles/theme';

import '../i18n';

import Layout from 'sections/shared/Layout';

const App: FC<AppProps> = ({ Component, pageProps }) => {
	const { t } = useTranslation();
	return (
		<RecoilRoot>
			<SCThemeProvider theme={scTheme}>
				<MuiThemeProvider theme={muiTheme}>
					<WithStateContainers>
						<Layout>
							<Component {...pageProps} />
						</Layout>
					</WithStateContainers>
				</MuiThemeProvider>
			</SCThemeProvider>
		</RecoilRoot>
	);
};

export default App;
