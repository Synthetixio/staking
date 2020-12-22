import { useQuery, QueryConfig } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { SNXPriceData } from './types';

const useSNX24hrPricesQuery = (options?: QueryConfig<SNXPriceData[]>) =>
	useQuery<SNXPriceData[]>(
		QUERY_KEYS.Rates.SNX24hrPrices,
		async () => snxData.rate.snxAggregate({ timeSeries: '15m', max: 24 * 4 }),
		{
			...options,
		}
	);

export default useSNX24hrPricesQuery;
