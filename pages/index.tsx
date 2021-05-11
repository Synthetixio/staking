import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';

import { FlexDivCol, LineSpacer, StatsSection } from 'styles/common';
import { PossibleActions } from 'sections/dashboard';

import StatBox from 'components/StatBox';
import useUserStakingData from 'hooks/useUserStakingData';

import { formatBNFiatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

const DashboardPage = () => {
	const { t } = useTranslation();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const { stakedValue, stakingAPR, debtBalance } = useUserStakingData();

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<Content>
				<StatsSection>
					<StakedValue
						title={t('common.stat-box.staked-value')}
						value={formatBNFiatCurrency(
							getPriceAtCurrentRate(!stakedValue ? zeroBN : stakedValue),
							{
								sign: selectedPriceCurrency.sign,
							}
						)}
					/>
					<APR
						title={t('common.stat-box.earning')}
						value={formatPercent(stakingAPR ? stakingAPR / 1e18 : 0)}
						size="lg"
					/>
					<ActiveDebt
						title={t('common.stat-box.active-debt')}
						value={formatBNFiatCurrency(getPriceAtCurrentRate(debtBalance), {
							sign: selectedPriceCurrency.sign,
						})}
					/>
				</StatsSection>
				<LineSpacer />
				<PossibleActions />
			</Content>
		</>
	);
};

const Content = styled(FlexDivCol)`
	width: 100%;
	max-width: 1200px;
`;

const StakedValue = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.blue};
	}
`;

const APR = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.green};
	}
	.value {
		text-shadow: ${(props) => props.theme.colors.greenTextShadow};
		color: #073124;
	}
`;

const ActiveDebt = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.pink};
	}
`;

export default DashboardPage;
