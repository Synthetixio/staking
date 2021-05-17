import { FC, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import UIContainer from 'containers/UI';
import StatBox from 'components/StatBox';
import StatsSection from 'components/StatsSection';
import { LineSpacer } from 'styles/common';
import Main from 'sections/synths';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

const SynthsPage: FC = () => {
	const { t } = useTranslation();
	const { setTitle } = UIContainer.useContainer();

	const synthsBalancesQuery = useSynthsBalancesQuery();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();

	const totalSynthValue = synthsBalancesQuery.isSuccess
		? synthsBalancesQuery.data?.totalUSDBalance ?? zeroBN
		: zeroBN;

	// header title
	useEffect(() => {
		setTitle('wallet', 'synths');
	}, [setTitle]);

	return (
		<>
			<Head>
				<title>{t('synths.page-title')}</title>
			</Head>
			<StatsSection>
				<div />
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
				<div />
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
