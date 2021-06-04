import { useQuery, QueryConfig } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey, Synths, sUSD_EXCHANGE_RATE } from 'constants/currency';
import { PERIOD_IN_HOURS, Period } from 'constants/period';

import {
	calculateTimestampForPeriod,
	getMinAndMaxRate,
	calculateRateChange,
	mockHistoricalRates,
} from './utils';
import { HistoricalRatesUpdates } from './types';

const useHistoricalRatesQuery = (
	currencyKey: CurrencyKey | null,
	period: Period = Period.ONE_DAY,
	options?: QueryConfig<HistoricalRatesUpdates>
) => {
	const periodInHours = PERIOD_IN_HOURS[period];

	return useQuery<HistoricalRatesUpdates>(
		QUERY_KEYS.Rates.HistoricalRates(currencyKey as string, period),
		async () => {
			if (currencyKey === Synths.sUSD) {
				return {
					rates: mockHistoricalRates(periodInHours, sUSD_EXCHANGE_RATE),
					low: sUSD_EXCHANGE_RATE,
					high: sUSD_EXCHANGE_RATE,
					change: 0,
				};
			} else {
				const rates = await snxData.rate.updates({
					synth: currencyKey,
					// maxTimestamp: Math.trunc(now / 1000),
					minTimestamp: calculateTimestampForPeriod(periodInHours),
					max: 6000,
				});

				const [low, high] = getMinAndMaxRate(rates);
				const change = calculateRateChange(rates);

				return {
					rates: rates.slice().reverse(),
					low,
					high,
					change,
				};
			}
		},
		{
			enabled: currencyKey,
			...options,
		}
	);
};

export default useHistoricalRatesQuery;
