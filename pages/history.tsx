import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import { StatsSection } from 'styles/common';

import TransactionsContainer from 'sections/history/TransactionsContainer';
import useHistoryTransactions from 'sections/history/hooks/useHistoryTransactions';

const HistoryPage = () => {
	const { t } = useTranslation();
	const { txCount, burned, issued, feesClaimed, isLoaded } = useHistoryTransactions();

	return (
		<>
			<Head>
				<title>{t('history.page-title')}</title>
			</Head>
			<StatsSection></StatsSection>
			<TransactionsContainer
				burned={burned}
				issued={issued}
				feesClaimed={feesClaimed}
				isLoaded={isLoaded}
			/>
		</>
	);
};

export default HistoryPage;
