import { FC, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';

import { FlexDivCol, LineSpacer } from 'styles/common';
import { PossibleActions } from 'sections/dashboard';

import UIContainer from 'containers/UI';
import StatBox from 'components/StatBox';
import StatsSection from 'components/StatsSection';
import useUserStakingData from 'hooks/useUserStakingData';

import { formatFiatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

const DashboardPage: FC = () => {
	const { t } = useTranslation();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const { stakedValue, stakingAPR, debtBalance } = useUserStakingData();
	const { setTitle } = UIContainer.useContainer();

	// header title
	useEffect(() => {
		setTitle('home');
	}, [setTitle]);

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<Content>
				<StatsSection>
					<StakedValue
						title={t('common.stat-box.staked-value')}
						value={formatFiatCurrency(
							getPriceAtCurrentRate(stakedValue.isNaN() ? zeroBN : stakedValue),
							{
								sign: selectedPriceCurrency.sign,
							}
						)}
					/>
					<APR
						title={t('common.stat-box.earning')}
						value={formatPercent(stakingAPR ? stakingAPR : 0)}
						size="lg"
					/>
					<ActiveDebt
						title={t('common.stat-box.active-debt')}
						value={formatFiatCurrency(getPriceAtCurrentRate(debtBalance), {
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
