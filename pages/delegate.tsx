import { FC, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import StatBox from 'components/StatBox';
import UIContainer from 'containers/UI';
import { LineSpacer } from 'styles/common';
import useUserStakingData from 'hooks/useUserStakingData';
import Main from 'sections/delegate/index';
import StatsSection from 'components/StatsSection';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatFiatCurrency, formatPercent, toBigNumber } from 'utils/formatters/number';

const DelegatePage: FC = () => {
	const { t } = useTranslation();
	const { setTitle } = UIContainer.useContainer();

	const { stakedCollateralValue, debtBalance } = useStakingCalculations();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const { stakingAPR } = useUserStakingData();

	// header title
	useEffect(() => {
		setTitle('wallet', 'delegate');
	}, [setTitle]);

	return (
		<>
			<Head>
				<title>{t('delegate.page-title')}</title>
			</Head>
			<StatsSection>
				<StakedValue
					title={t('common.stat-box.staked-value')}
					value={formatFiatCurrency(
						getPriceAtCurrentRate(
							stakedCollateralValue.isNaN() ? toBigNumber(0) : stakedCollateralValue
						),
						{
							sign: selectedPriceCurrency.sign,
						}
					)}
				/>
				<Earning
					title={t('common.stat-box.earning')}
					value={formatPercent(stakingAPR ? stakingAPR : 0)}
					size="lg"
				/>
				<ActiveDebt
					title={t('common.stat-box.active-debt')}
					value={formatFiatCurrency(
						getPriceAtCurrentRate(debtBalance.isNaN() ? toBigNumber(0) : debtBalance),
						{
							sign: selectedPriceCurrency.sign,
						}
					)}
				/>
			</StatsSection>
			<LineSpacer />
			<Main />
		</>
	);
};

const StakedValue = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.green};
	}
`;

const Earning = styled(StatBox)`
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
		color: ${(props) => props.theme.colors.green};
	}
`;

export default DelegatePage;
