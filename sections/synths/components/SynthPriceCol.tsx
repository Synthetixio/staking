import { FC } from 'react';
import styled from 'styled-components';

import media from 'styles/media';

import { Period } from 'constants/period';

import CurrencyPrice from 'components/Currency/CurrencyPrice';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { NO_VALUE } from 'constants/placeholder';
import useSynthetixQueries from '@synthetixio/queries';

type SynthPriceColProps = {
	currencyKey: CurrencyKey;
};

const SynthPriceCol: FC<SynthPriceColProps> = ({ currencyKey }) => {
	const { useExchangeRatesQuery, useHistoricalRatesQuery } = useSynthetixQueries();

	const exchangeRatesQuery = useExchangeRatesQuery();
	const historicalRates = useHistoricalRatesQuery(currencyKey, Period.ONE_DAY);
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
					change={historicalRates.data?.change}
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
