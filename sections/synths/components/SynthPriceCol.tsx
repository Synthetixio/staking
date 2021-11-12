import { FC } from 'react';
import styled from 'styled-components';

import media from 'styles/media';

import CurrencyPrice from 'components/Currency/CurrencyPrice';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { NO_VALUE } from 'constants/placeholder';
import useSynthetixQueries from '@synthetixio/queries';
import { calculatePercentChange } from 'utils/currencies';
import { Period, PERIOD_IN_SECONDS } from 'constants/period';

type SynthPriceColProps = {
	currencyKey: CurrencyKey;
};

const SynthPriceCol: FC<SynthPriceColProps> = ({ currencyKey }) => {
	const { useExchangeRatesQuery, exchanges } = useSynthetixQueries();

	const exchangeRatesQuery = useExchangeRatesQuery();

	const oneDayAgoSeconds = Math.floor(Date.now() / 1000) - PERIOD_IN_SECONDS[Period.ONE_DAY];

	const historicalRates = exchanges.useGetRateUpdates(
		{
			orderBy: 'timestamp',
			orderDirection: 'desc',
			where: { timestamp_gt: oneDayAgoSeconds, synth: currencyKey },
		},
		{ timestamp: true, rate: true }
	);

	const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();

	const exchangeRates = exchangeRatesQuery.data ?? null;
	const price = exchangeRates && exchangeRates[currencyKey];

	return (
		<>
			{price != null ? (
				<StyledCurrencyPrice
					currencyKey={currencyKey}
					price={price}
					sign={selectedPriceCurrency.sign}
					change={calculatePercentChange(
						historicalRates.data?.[historicalRates.data?.length - 1]?.rate,
						historicalRates.data?.[0]?.rate
					).toNumber()}
					conversionRate={selectPriceCurrencyRate}
				/>
			) : (
				NO_VALUE
			)}
		</>
	);
};

const StyledCurrencyPrice = styled(CurrencyPrice)`
	${media.lessThan('md')`
		display: flex;
		grid-gap: 1rem;
	`}
`;

export default SynthPriceCol;
