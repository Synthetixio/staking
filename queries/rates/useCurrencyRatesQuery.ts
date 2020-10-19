import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';

export type Rates = Record<CurrencyKey, number>;

const useCurrencyRatesQuery = (currencies: string[], options?: QueryConfig<Rates>) => {
	return useQuery<Rates>(
		QUERY_KEYS.Rates.CurrencyRates,
		async () => {
			const currencyRates: Rates = {};

			const mappedCurrencies = currencies.map((e) => ethers.utils.formatBytes32String(e!));
			const rates = await synthetix.js?.contracts.ExchangeRates.ratesForCurrencies(
				mappedCurrencies
			);

			rates.forEach((_: any, idx: number) => {
				const currencyName = currencies[idx];
				currencyRates[currencyName] = Number(ethers.utils.formatEther(rates[idx]));
			});

			return currencyRates;
		},
		{
			enabled: synthetix.js,
			...options,
		}
	);
};

export default useCurrencyRatesQuery;
