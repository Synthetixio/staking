import { FC, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { LineSpacer } from 'styles/common';
import UIContainer from 'containers/UI';
import TransactionsContainer from 'sections/history/TransactionsContainer';
import StatsSection from 'components/StatsSection';

import StatBox from 'components/StatBox';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';

const HistoryPage: FC = () => {
	const { t } = useTranslation();

	const walletAddress = useRecoilValue(walletAddressState);

	const { useFeeClaimHistoryQuery } = useSynthetixQueries();

	const feesClaimedQuery = useFeeClaimHistoryQuery(walletAddress);
	const { setTitle } = UIContainer.useContainer();

	const isLoaded = feesClaimedQuery.isSuccess;
	const feesClaimed = feesClaimedQuery.data ?? [];

	const txCount = useMemo(() => (isLoaded ? feesClaimed.length : 0), [
		isLoaded,
		feesClaimed.length,
	]);

	// header title
	useEffect(() => {
		setTitle('wallet', 'history');
	}, [setTitle]);

	return (
		<>
			<Head>
				<title>{t('history.page-title')}</title>
			</Head>
			<StatsSection>
				<div />
				<TxCount title={t('common.stat-box.tx-count')} value={txCount} size="lg" />
				<div />
			</StatsSection>
			<LineSpacer />
			<TransactionsContainer history={feesClaimed} isLoaded={isLoaded} />
		</>
	);
};

const TxCount = styled(StatBox)`
	.value {
		text-shadow: ${(props) => props.theme.colors.blueTextShadow};
		color: ${(props) => props.theme.colors.black};
	}
`;

export default HistoryPage;
