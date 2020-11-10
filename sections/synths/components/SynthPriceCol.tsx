import React from 'react';
import styled from 'styled-components';
import useHistoricalRatesQuery from 'queries/rates/useHistoricalRatesQuery';
import { useTranslation } from 'react-i18next';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { FlexDivCol } from 'styles/common';
import CurrencyPrice from 'components/Currency/CurrencyPrice';
import { Period } from 'constants/period';

interface SynthPriceColProps {
	currencyKey: string;
}

export const SynthPriceCol: React.FC<SynthPriceColProps> = ({ currencyKey }) => {
	const { t } = useTranslation();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;
	const price = exchangeRates && exchangeRates[currencyKey];
	const historicalRates = useHistoricalRatesQuery(currencyKey, Period.ONE_DAY);

	return (
		<FlexDivCol>
			{price != null && (
				<StyledCurrencyPrice
					currencyKey={currencyKey}
					price={price}
					sign="$"
					change={historicalRates.data?.change}
				/>
			)}
		</FlexDivCol>
	);
};

const StyledCurrencyPrice = styled(CurrencyPrice)`
	display: flex;
	flex-direction: column;

	.price {
		font-family: ${(props) => props.theme.fonts.mono};
		width: 85px;
		margin-bottom: 4px;
	}
	.percent {
		font-family: ${(props) => props.theme.fonts.interBold};
		font-size: 10px;
	}
`;
