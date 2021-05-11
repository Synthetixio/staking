import { useQuery, QueryConfig } from 'react-query';
import { BigNumberish, ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import BN from 'bn.js';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { CryptoCurrency, CurrencyKey } from 'constants/currency';
import { iStandardSynth, synthToAsset } from 'utils/currencies';

import { appReadyState } from 'store/app';
import { toBigNumber } from 'utils/formatters/number';

export type Rates = Record<CurrencyKey, BN>;

type CurrencyRate = BigNumberish;
type SynthRatesTuple = [string[], CurrencyRate[]];

// Additional commonly used currencies to fetch, besides the one returned by the SynthUtil.synthsRates
const additionalCurrencies = [CryptoCurrency.SNX, CryptoCurrency.BTC].map(
	ethers.utils.formatBytes32String
);

const useExchangeRatesQuery = (options?: QueryConfig<Rates>) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<Rates>(
		QUERY_KEYS.Rates.ExchangeRates,
		async () => {
			const exchangeRates: Rates = {};

			const [synthsRates, ratesForCurrencies] = (await Promise.all([
				synthetix.js?.contracts.SynthUtil.synthsRates(),
				synthetix.js?.contracts.ExchangeRates.ratesForCurrencies(additionalCurrencies),
			])) as [SynthRatesTuple, CurrencyRate[]];

			const synths = [...synthsRates[0], ...additionalCurrencies] as string[];
			const rates = [...synthsRates[1], ...ratesForCurrencies] as CurrencyRate[];

			synths.forEach((currencyKeyBytes32: CurrencyKey, idx: number) => {
				const currencyKey = ethers.utils.parseBytes32String(currencyKeyBytes32);
				const rate = toBigNumber(rates[idx].toString());

				exchangeRates[currencyKey] = rate;
				// only interested in the standard synths (sETH -> ETH, etc)
				if (iStandardSynth(currencyKey)) {
					exchangeRates[synthToAsset(currencyKey)] = rate;
				}
			});

			return exchangeRates;
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useExchangeRatesQuery;
