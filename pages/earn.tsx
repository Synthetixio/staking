import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Column, FlexDivRowCentered, Row } from 'styles/common';

import { Incentives, ClaimBox } from 'sections/earn';
import StatBox from 'components/StatBox';
import styled from 'styled-components';
import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';
import useTotalIssuedSynthsExcludingEtherQuery from 'queries/synths/useTotalIssuedSynthsExcludingEtherQuery';

const Earn = () => {
	const { t } = useTranslation();

	const debtDataQuery = useGetDebtDataQuery();
	const currencyRates = useCurrencyRatesQuery(['SNX']);
	const totalIssuedSynthsExclEth = useTotalIssuedSynthsExcludingEtherQuery('sUSD');
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
			<StatsSection>
				<StyledUpcomingRewards
					title={t('common.stat-box.upcoming-rewards')}
					value={formatFiatCurrency(stakedValue ? stakedValue : 0, { sign: '$' })}
				/>
				<StyledAPY
					title={t('common.stat-box.earning')}
					value={formatPercent(stakingApy ? stakingApy : 0)}
				/>
				<StyledLifetimeRewards
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
		</>
	);
};

const StatsSection = styled(FlexDivRowCentered)`
	width: 100%;
	justify-content: center;
	margin: 0 auto;
`;

const StyledUpcomingRewards = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.brightGreen};
	}
`;
const StyledAPY = styled(StatBox)`
	transform: scale(1.1);
	.title {
		color: ${(props) => props.theme.colors.brightGreen};
	}
	.value {
		text-shadow: rgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px,
			rgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px,
			rgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px;
		color: #073124;
	}
`;
const StyledLifetimeRewards = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.brightGreen};
	}
`;

export default Earn;
