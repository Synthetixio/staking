import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import AppLayout from 'sections/shared/Layout/AppLayout';

import { StatsSection, LineSpacer } from 'styles/common';

import TransactionsContainer from 'sections/history/TransactionsContainer';
import useHistoryTransactions from 'sections/history/hooks/useHistoryTransactions';

import StatBox from 'components/StatBox';

const HistoryPage = () => {
	const { t } = useTranslation();
	const { txCount, burned, issued, feesClaimed, isLoaded } = useHistoryTransactions();

	return (
		<>
			<Head>
				<title>{t('history.page-title')}</title>
			</Head>
			<AppLayout>
				<StatsSection>
					<TxCount title={t('common.stat-box.tx-count')} value={txCount} size="lg" />
				</StatsSection>
				<LineSpacer />
				<TransactionsContainer
					burned={burned}
					issued={issued}
					feesClaimed={feesClaimed}
					isLoaded={isLoaded}
				/>
			</AppLayout>
		</>
	);
};

const TxCount = styled(StatBox)`
	.value {
		text-shadow: ${(props) => props.theme.colors.brightBlueTextShadow};
		color: ${(props) => props.theme.colors.darkBlue};
	}
`;

export default HistoryPage;
