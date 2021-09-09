import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';
import { Synths } from '@synthetixio/contracts-interface';
import BigNumber from 'bignumber.js';

import { CryptoBalance } from 'queries/walletBalances/types';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';
import { toBigNumber } from 'utils/formatters/number';
import { getExchangeRatesForCurrencies } from 'utils/currencies';

type Ret = {
	balances: CryptoBalance[];
	totalUSDBalance: BigNumber;
};

const useRedeemableDeprecatedSynthsQuery = (options?: QueryConfig<Ret>) => {
	const network = useRecoilValue(networkState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	return useQuery<Ret>(
		['WalletBalances', 'RedeemableDeprecatedSynths', network?.id!, walletAddress],
		async () => {
			const exchangeRates = exchangeRatesQuery.data ?? null;

			const deprecatedSynths = [Synths.sAAPL, Synths.sGOOG].map(ethers.utils.formatBytes32String);
			const balances = [toBigNumber(3), toBigNumber(4)];
			let totalUSDBalance = toBigNumber(0);

			const cryptoBalances: CryptoBalance[] = balances.map((balance, i) => {
				const currencyKey = deprecatedSynths[i];
				const synth = ethers.utils.parseBytes32String(currencyKey);
				const synthPriceRate = getExchangeRatesForCurrencies(
					exchangeRates,
					synth,
					selectedPriceCurrency.name
				);

				const usdBalance = balance.times(toBigNumber(synthPriceRate));
				totalUSDBalance = totalUSDBalance.plus(usdBalance);
				return {
					currencyKey: synth,
					balance,
					usdBalance,
				};
			});
			return {
				balances: cryptoBalances,
				totalUSDBalance,
			};
		},
		{
			enabled: isWalletConnected,
			...options,
		}
	);
};

export default useRedeemableDeprecatedSynthsQuery;
