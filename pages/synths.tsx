import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { StatsSection, LineSpacer } from 'styles/common';

import AssetsTable from 'sections/synths/AssetsTable';

import StatBox from 'components/StatBox';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';

import { NO_VALUE } from 'constants/placeholder';
import { formatCurrency, zeroBN } from 'utils/formatters/number';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useCryptoBalances from 'hooks/useCryptoBalances';

const SynthsPage = () => {
	const { t } = useTranslation();

	const synthsBalancesQuery = useSynthsBalancesQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const cryptoBalances = useCryptoBalances();

	const totalSynthValue = synthsBalancesQuery.isSuccess
		? synthsBalancesQuery.data?.totalUSDBalance ?? zeroBN
		: null;

	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;

	const synthAssets = synthBalances?.balances ?? [];

	return (
		<>
			<Head>
				<title>{t('synths.page-title')}</title>
			</Head>
			<StatsSection>
				<TotalSynthValue
					title={t('common.stat-box.synth-value')}
					value={
						totalSynthValue != null
							? formatCurrency(selectedPriceCurrency.name, totalSynthValue, {
									sign: selectedPriceCurrency.sign,
							  })
							: NO_VALUE
					}
					size="lg"
				/>
			</StatsSection>
			<LineSpacer />
			<AssetsTable
				title={t('synths.synths.title')}
				assets={synthAssets}
				totalValue={totalSynthValue ?? zeroBN}
				isLoading={synthsBalancesQuery.isLoading}
				isLoaded={synthsBalancesQuery.isSuccess}
				showHoldings={true}
				showConvert={false}
			/>
			<AssetsTable
				title={t('synths.non-synths.title')}
				assets={cryptoBalances.balances}
				totalValue={zeroBN}
				isLoading={!cryptoBalances.isLoaded}
				isLoaded={cryptoBalances.isLoaded}
				showHoldings={false}
				showConvert={true}
			/>
		</>
	);
};

const TotalSynthValue = styled(StatBox)`
	.value {
		text-shadow: ${(props) => props.theme.colors.brightBlueTextShadow};
		color: ${(props) => props.theme.colors.darkBlue};
	}
`;

export default SynthsPage;
