import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import { LineSpacer } from 'styles/common';

import AssetsTable from 'sections/synths/AssetsTable';

import StatBox from 'components/StatBox';
import StatsSection from 'components/StatsSection';
import { isWalletConnectedState } from 'store/wallet';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';

import { formatCurrency, zeroBN } from 'utils/formatters/number';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useCryptoBalances from 'hooks/useCryptoBalances';

const SynthsPage = () => {
	const { t } = useTranslation();

	const synthsBalancesQuery = useSynthsBalancesQuery();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const cryptoBalances = useCryptoBalances();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const totalSynthValue = synthsBalancesQuery.isSuccess
		? synthsBalancesQuery.data?.totalUSDBalance ?? zeroBN
		: zeroBN;

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
			<AssetsTable
				title={t('synths.assets.synths.title')}
				assets={synthAssets}
				totalValue={totalSynthValue ?? zeroBN}
				isLoading={synthsBalancesQuery.isLoading}
				isLoaded={synthsBalancesQuery.isSuccess}
				showHoldings={true}
				showConvert={false}
			/>
			{isWalletConnected && cryptoBalances.balances.length > 0 && (
				<AssetsTable
					title={t('synths.assets.non-synths.title')}
					assets={cryptoBalances.balances}
					totalValue={zeroBN}
					isLoading={!cryptoBalances.isLoaded}
					isLoaded={cryptoBalances.isLoaded}
					showHoldings={false}
					showConvert={true}
				/>
			)}
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
