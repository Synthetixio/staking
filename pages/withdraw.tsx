import { FC, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import UIContainer from 'containers/UI';
import Main from 'sections/layer2/withdraw';
import StatBox from 'components/StatBox';
import { LineSpacer } from 'styles/common';
import StatsSection from 'components/StatsSection';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatFiatCurrency, formatPercent, formatCryptoCurrency } from 'utils/formatters/number';

const SNX_HEADER_DECIMALS = 2;

const WidthdrawPage: FC = () => {
	const { t } = useTranslation();
	const { setTitle } = UIContainer.useContainer();

	const { percentageCurrentCRatio, debtBalance, transferableCollateral } = useStakingCalculations();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();

	// header title
	useEffect(() => {
		setTitle('l2', 'withdraw');
	}, [setTitle]);

	return (
		<>
			<Head>
				<title>{t('layer2.page-title')}</title>
			</Head>
			<StatsSection>
				<TransferableValue
					title={t('common.stat-box.available-snx')}
					value={formatCryptoCurrency(transferableCollateral ?? 0, {
						decimals: SNX_HEADER_DECIMALS,
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
				/>
			</StatsSection>
			<LineSpacer />
			<Main />
		</>
	);
};

const TransferableValue = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.blue};
	}
`;
const CRatio = styled(StatBox)`
	.value {
		text-shadow: ${(props) => props.theme.colors.blueTextShadow};
		color: ${(props) => props.theme.colors.black};
	}
`;
const ActiveDebt = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.pink};
	}
`;
export default WidthdrawPage;
