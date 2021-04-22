import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { StatsSection, LineSpacer } from 'styles/common';

import Main from 'sections/synths';

import StatBox from 'components/StatBox';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';

import { formatCurrency, zeroBN } from 'utils/formatters/number';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

const SynthsPage = () => {
	const { t } = useTranslation();

	const synthsBalancesQuery = useSynthsBalancesQuery();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();

	const totalSynthValue = synthsBalancesQuery.isSuccess
		? synthsBalancesQuery.data?.totalUSDBalance ?? zeroBN
		: zeroBN;

	return (
		<>
			<Head>
				<title>{t('synths.page-title')}</title>
			</Head>
			<StatsSection>
				<TotalSynthValue
					title={t('common.stat-box.synth-value')}
					value={formatCurrency(
						selectedPriceCurrency.name,
						getPriceAtCurrentRate(totalSynthValue),
						{
							sign: selectedPriceCurrency.sign,
						}
					)}
					size="lg"
				/>
			</StatsSection>
			<LineSpacer />
			<Main />
		</>
	);
};

const TotalSynthValue = styled(StatBox)`
	.value {
		text-shadow: ${(props) => props.theme.colors.blueTextShadow};
		color: ${(props) => props.theme.colors.black};
	}
`;

export default SynthsPage;
