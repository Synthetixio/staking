import { createQueryContext, SynthetixQueryContextProvider } from '@synthetixio/queries';
import { FC } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from 'styles/theme';
import { QueryClient, QueryClientProvider } from 'react-query';

const ContextProvider: FC = ({ children }) => {
	return (
		<QueryClientProvider client={new QueryClient()} contextSharing={true}>
			<SynthetixQueryContextProvider value={createQueryContext({ networkId: 10 })}>
				<ThemeProvider theme={theme}>{children}</ThemeProvider>
			</SynthetixQueryContextProvider>
		</QueryClientProvider>
	);
};

export default ContextProvider;
