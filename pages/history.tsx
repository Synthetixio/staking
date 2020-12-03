import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { isWalletConnectedState } from 'store/wallet';

import { StatsSection, LineSpacer } from 'styles/common';

import TransactionsContainer from 'sections/history/TransactionsContainer';

import useFeeClaimHistoryQuery from 'queries/staking/useFeeClaimHistoryQuery';
import useSynthBurnedQuery from 'queries/staking/useSynthBurnedQuery';
import useSynthIssuedQuery from 'queries/staking/useSynthIssuedQuery';

import { NO_VALUE } from 'constants/placeholder';

import StatBox from 'components/StatBox';

const HistoryPage = () => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const issuedQuery = useSynthIssuedQuery();
	const burnedQuery = useSynthBurnedQuery();
	const feesClaimedQuery = useFeeClaimHistoryQuery();

	const isLoaded = issuedQuery.isSuccess && burnedQuery.isSuccess && feesClaimedQuery.isSuccess;
	const issued = issuedQuery.data ?? [];
	const burned = burnedQuery.data ?? [];
	const feesClaimed = feesClaimedQuery.data ?? [];

	const txCount = useMemo(
		() => (isLoaded ? issued.length + burned.length + feesClaimed.length : 0),
		[isLoaded, issued.length, burned.length, feesClaimed.length]
	);

	return (
		<>
			<Head>
				<title>{t('history.page-title')}</title>
			</Head>
			<StatsSection>
				<TxCount
					title={t('common.stat-box.tx-count')}
					value={isWalletConnected ? txCount : NO_VALUE}
					size="lg"
				/>
			</StatsSection>
			<LineSpacer />
			<TransactionsContainer
				burned={burned}
				issued={issued}
				feesClaimed={feesClaimed}
				isLoaded={isLoaded}
			/>
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
