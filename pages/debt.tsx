import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { last } from 'lodash';

import { FlexDivCol, LineSpacer, StatsSection } from 'styles/common';

import StatBox from 'components/StatBox';
import useUserStakingData from 'hooks/useUserStakingData';

import { formatFiatCurrency, toBigNumber, zeroBN } from 'utils/formatters/number';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';

import useHistoricalDebtData from 'hooks/useHistoricalDebtData';
import Main from 'sections/debt';

const DashboardPage = () => {
	const { t } = useTranslation();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const { debtBalance: actualDebt } = useUserStakingData();
	const synthsBalancesQuery = useSynthsBalancesQuery();

	const historicalDebt = useHistoricalDebtData();

	const totalSynthValue = synthsBalancesQuery.isSuccess
		? synthsBalancesQuery.data?.totalUSDBalance ?? zeroBN
		: zeroBN;

	const dataIsLoading = historicalDebt?.isLoading ?? false;
	const issuedDebt = dataIsLoading
		? toBigNumber(0)
		: toBigNumber(last(historicalDebt.data)?.issuanceDebt ?? 0);

	return (
		<>
			<Head>
				<title>{t('debt.page-title')}</title>
			</Head>
			<Content>
				<StatsSection>
					<IssuedDebt
						title={t('common.stat-box.issued-debt')}
						value={formatFiatCurrency(getPriceAtCurrentRate(issuedDebt), {
							sign: selectedPriceCurrency.sign,
						})}
					/>
					<ActiveDebt
						title={t('common.stat-box.active-debt')}
						value={formatFiatCurrency(getPriceAtCurrentRate(actualDebt), {
							sign: selectedPriceCurrency.sign,
						})}
						size="lg"
					/>
					<TotalSynthValue
						title={t('common.stat-box.synth-value')}
						value={formatFiatCurrency(getPriceAtCurrentRate(totalSynthValue), {
							sign: selectedPriceCurrency.sign,
						})}
					/>
				</StatsSection>
				<LineSpacer />
				<Main />
			</Content>
		</>
	);
};

const Content = styled(FlexDivCol)`
	width: 100%;
	max-width: 1200px;
`;

const IssuedDebt = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.blue};
	}
`;

const ActiveDebt = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.pink};
	}
	.value {
		text-shadow: ${(props) => props.theme.colors.pinkTextShadow};
		color: ${(props) => props.theme.colors.navy};
	}
`;

const TotalSynthValue = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.purple};
	}
`;

export default DashboardPage;
