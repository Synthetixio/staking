import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Column, StatsSection, Row } from 'styles/common';

import AppLayout from 'sections/shared/Layout/AppLayout';
import ClaimBox from 'sections/earn/ClaimBox';
import Incentives from 'sections/earn/Incentives';
import StatBox from 'components/StatBox';

import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';

import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';
import useTotalIssuedSynthsExcludingEtherQuery from 'queries/synths/useTotalIssuedSynthsExcludingEtherQuery';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';

const Earn = () => {
	const { t } = useTranslation();

	const debtDataQuery = useGetDebtDataQuery();
	const currencyRates = useCurrencyRatesQuery([CRYPTO_CURRENCY_MAP.SNX]);
	const totalIssuedSynthsExclEth = useTotalIssuedSynthsExcludingEtherQuery(SYNTHS_MAP.sUSD);
	const exchangeRates = useExchangeRatesQuery();
	const previousFeePeriod = useGetFeePoolDataQuery('1');

	const currentCRatio = debtDataQuery.data?.currentCRatio ?? 0;
	const targetCRatio = debtDataQuery.data?.targetCRatio ?? 0;
	const activeDebt = debtDataQuery.data?.debtBalance ?? 0;
	const collateral = debtDataQuery.data?.collateral ?? 0;
	const sUSDRate = exchangeRates.data?.sUSD ?? 0;
	const feesToDistribute = previousFeePeriod?.data?.feesToDistribute ?? 0;
	const rewardsToDistribute = previousFeePeriod?.data?.rewardsToDistribute ?? 0;
	const totalsUSDDebt = totalIssuedSynthsExclEth?.data ?? 0;
	const SNXRate = currencyRates.data?.SNX ?? 0;

	const stakedValue = collateral * Math.min(1, currentCRatio / targetCRatio) * SNXRate;
	const weeklyRewards = sUSDRate * feesToDistribute + SNXRate * rewardsToDistribute;
	const stakingApy = (weeklyRewards * (activeDebt / totalsUSDDebt) * 52) / (stakedValue * SNXRate);

	return (
		<>
			<Head>
				<title>{t('earn.page-title')}</title>
			</Head>
			<AppLayout>
				<StatsSection>
					<UpcomingRewards
						title={t('common.stat-box.upcoming-rewards')}
						value={formatFiatCurrency(stakedValue ? stakedValue : 0, { sign: '$' })}
					/>
					<APY
						title={t('common.stat-box.earning')}
						value={formatPercent(stakingApy ? stakingApy : 0)}
						size="lg"
					/>
					<LifetimeRewards
						title={t('common.stat-box.lifetime-rewards')}
						value={formatFiatCurrency(activeDebt ? activeDebt : 0, { sign: '$' })}
					/>
				</StatsSection>
				<Row>
					<Column>
						<Incentives />
					</Column>
					<Column>
						<ClaimBox />
					</Column>
				</Row>
			</AppLayout>
		</>
	);
};

const UpcomingRewards = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.brightGreen};
	}
`;
const APY = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.brightGreen};
	}
	.value {
		text-shadow: ${(props) => props.theme.colors.brightGreenTextShadow};
		color: #073124;
	}
`;
const LifetimeRewards = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.brightGreen};
	}
`;

export default Earn;
