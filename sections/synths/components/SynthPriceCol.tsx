import { FC } from 'react';
import styled from 'styled-components';

import useHistoricalRatesQuery from 'queries/rates/useHistoricalRatesQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { Period } from 'constants/period';

import { FlexDivCol } from 'styles/common';

import CurrencyPrice from 'components/Currency/CurrencyPrice';
import { CurrencyKey } from 'constants/currency';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { NO_VALUE } from 'constants/placeholder';

type SynthPriceColProps = {
	currencyKey: CurrencyKey;
};

const SynthPriceCol: FC<SynthPriceColProps> = ({ currencyKey }) => {
	const exchangeRatesQuery = useExchangeRatesQuery();
	const historicalRates = useHistoricalRatesQuery(currencyKey, Period.ONE_DAY);
	const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();

	const exchangeRates = exchangeRatesQuery.data ?? null;
	const price = exchangeRates && exchangeRates[currencyKey];

	return (
		<FlexDivCol>
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
		</FlexDivCol>
	);
};

const StyledCurrencyPrice = styled(CurrencyPrice)`
	.price {
		font-family: ${(props) => props.theme.fonts.mono};
		padding-bottom: 1px;
	}
	.percent {
		font-family: ${(props) => props.theme.fonts.interBold};
		font-size: 10px;
	}
`;

export default SynthPriceCol;
