import { FC, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Main from 'sections/layer2/deposit';
import StatBox from 'components/StatBox';
import { LineSpacer } from 'styles/common';
import StatsSection from 'components/StatsSection';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';
import UIContainer from 'containers/UI';
import StakedValue from 'sections/shared/modals/StakedValueModal/StakedValueBox';
import ActiveDebt from 'sections/shared/modals/DebtValueModal/DebtValueBox';

const L2Page: FC = () => {
	const { t } = useTranslation();
	const { setTitle } = UIContainer.useContainer();

	const { stakedCollateralValue, percentageCurrentCRatio, debtBalance } = useStakingCalculations();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();

	// header title
	useEffect(() => {
		setTitle('l2', 'deposit');
	}, [setTitle]);

	return (
		<>
			<Head>
				<title>{t('layer2.page-title')}</title>
			</Head>
			<StatsSection>
				<StakedValue
					title={t('common.stat-box.staked-value')}
					value={formatFiatCurrency(getPriceAtCurrentRate(stakedCollateralValue), {
						sign: selectedPriceCurrency.sign,
					})}
				/>
				<CRatio
					title={t('common.stat-box.c-ratio')}
					value={formatPercent(percentageCurrentCRatio)}
					size="lg"
				/>
				<ActiveDebt
					title={t('common.stat-box.active-debt')}
					value={formatFiatCurrency(getPriceAtCurrentRate(debtBalance), {
						sign: selectedPriceCurrency.sign,
					})}
					isPink
				/>
			</StatsSection>
			<LineSpacer />
			<Main />
		</>
	);
};

const CRatio = styled(StatBox)`
	.value {
		text-shadow: ${(props) => props.theme.colors.blueTextShadow};
		color: ${(props) => props.theme.colors.black};
	}
`;

export default L2Page;
