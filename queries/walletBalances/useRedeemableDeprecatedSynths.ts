import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';
import { Synths } from '@synthetixio/contracts-interface';
import BigNumber from 'bignumber.js';

import { CryptoBalance } from 'queries/walletBalances/types';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import {
	walletAddressState,
	isWalletConnectedState,
	networkState,
	isMainnetState,
} from 'store/wallet';
import Connector from 'containers/Connector';
import { toBigNumber } from 'utils/formatters/number';
import { getExchangeRatesForCurrencies } from 'utils/currencies';

type Ret = {
	balances: CryptoBalance[];
	totalUsdBalance: BigNumber;
};

const useRedeemableDeprecatedSynths = (options?: QueryConfig<Ret>) => {
	const { provider } = Connector.useContainer();
	const network = useRecoilValue(networkState);
	const isMainnet = useRecoilValue(isMainnetState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	return useQuery<Ret>(
		['WalletBalances', 'RedeemableDeprecatedSynths', network?.id!, walletAddress],
		async () => {
			// const { Redeemer } = synthetix.js!.contracts;

			// const synthDeprecatedEvent = Redeemer.filter.SynthDeprecated();
			// const deprecatedSynths = await Redeemer.queryFilter(synthDeprecatedEvent);

			// const getRedeemableSynthBalance = (event: { synth: string }) => {
			// 	return Redeemer.balanceOf(event.synth, walletAddress);
			// };

			// const balances = await Promise.all(deprecatedSynths.map(getRedeemableSynthBalance));

			const exchangeRates = exchangeRatesQuery.data ?? null;

			const deprecatedSynths = [Synths.sAAPL, Synths.sGOOG].map(ethers.utils.formatBytes32String);
			const balances = [toBigNumber(3), toBigNumber(4)];
			let totalUsdBalance = toBigNumber(0);

			const cryptoBalances: CryptoBalance[] = balances.map((balance, i) => {
				const currencyKey = deprecatedSynths[i];
				const synth = ethers.utils.parseBytes32String(currencyKey);
				const synthPriceRate = getExchangeRatesForCurrencies(
					exchangeRates,
					synth,
					selectedPriceCurrency.name
				);

				const usdBalance = balance.times(toBigNumber(synthPriceRate));
				totalUsdBalance = totalUsdBalance.plus(usdBalance);
				return {
					currencyKey: synth,
					balance,
					usdBalance,
					synth,
				};
			});
			return {
				balances: cryptoBalances,
				totalUsdBalance,
			};
		},
		{
			enabled: provider && isWalletConnected && isMainnet,
			...options,
		}
	);
};

export default useRedeemableDeprecatedSynths;
