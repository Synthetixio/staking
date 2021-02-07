import { useMemo } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { StatsSection, LineSpacer } from 'styles/common';

import DebtHistoryContainer from 'sections/history/DebtHistoryContainer';

import useSynthBurnedQuery from 'queries/staking/useSynthBurnedQuery';
import useSynthIssuedQuery from 'queries/staking/useSynthIssuedQuery';
import useDebtSnapshotHistoryQuery from 'queries/debt/useDebtSnapshotHistoryQuery';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useSynthBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { CryptoCurrency } from 'constants/currency';
const { SNX } = CryptoCurrency;

import StatBox from 'components/StatBox';

const DebtHistoryPage = () => {
	const { t } = useTranslation();
	const issuedQuery = useSynthIssuedQuery();
	const burnedQuery = useSynthBurnedQuery();
	const debtSnapshotHistoryQuery = useDebtSnapshotHistoryQuery();
	const getDebtDataQuery = useGetDebtDataQuery();
	const synthBalancesQuery = useSynthBalancesQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const isLoaded = issuedQuery.isSuccess && burnedQuery.isSuccess && debtSnapshotHistoryQuery.isSuccess && getDebtDataQuery.isSuccess && synthBalancesQuery.isSuccess && exchangeRatesQuery.isSuccess;

	const issued = issuedQuery.data ?? [];
	const burned = burnedQuery.data ?? [];
	const debtHistory = debtSnapshotHistoryQuery.data ?? [];
	const currentDebt = getDebtDataQuery.data ? getDebtDataQuery.data.debtBalance.toNumber() : 0;
	const totalSynthUSD = synthBalancesQuery.data ? synthBalancesQuery.data.totalUSDBalance.toNumber() : 0;
	const sUSDRate = exchangeRatesQuery.data ? exchangeRatesQuery.data[SNX] : 0;

	return (
		<>
			<Head>
				<title>{t('debt-history.page-title')}</title>
			</Head>
			<LineSpacer />
			<DebtHistoryContainer
				burned={burned}
				issued={issued}
				debtHistory={debtHistory}
				currentDebt={currentDebt}
				totalSynthUSD={totalSynthUSD}
				sUSDRate={sUSDRate}
				isLoaded={isLoaded}
			/>
		</>
	);
};

const TxCount = styled(StatBox)`
	.value {
		text-shadow: ${(props) => props.theme.colors.blueTextShadow};
		color: ${(props) => props.theme.colors.black};
	}
`;

export default DebtHistoryPage;
