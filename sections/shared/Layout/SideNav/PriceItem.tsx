import styled from 'styled-components';
import { FC } from 'react';
import { Trans } from 'react-i18next';

import { FlexDivCol, NoTextTransform } from 'styles/common';

import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';

import CurrencyPrice from 'components/Currency/CurrencyPrice';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

type PriceItemProps = {
	currencyKey: CurrencyKey;
};

const PriceItem: FC<PriceItemProps> = ({ currencyKey }) => {
	const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const exchangeRates = exchangeRatesQuery.data ?? null;
	const price = exchangeRates && exchangeRates[currencyKey];

	return (
		<Container>
			<Title>
				<Trans
					i18nKey="common.currency.currency-price"
					values={{ currencyKey }}
					components={[<NoTextTransform />]}
				/>
			</Title>
			{price != null ? (
				<StyledCurrencyPrice
					currencyKey={currencyKey}
					price={price}
					sign={selectedPriceCurrency.sign}
					conversionRate={selectPriceCurrencyRate}
				/>
			) : (
				NO_VALUE
			)}
		</Container>
	);
};

const Container = styled(FlexDivCol)`
	margin: 10px 0px;
	font-size: 12px;
	padding-bottom: 24px;
	&:last-child {
		padding-bottom: 0;
	}
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.interBold};
	color: ${(props) => props.theme.colors.silver};
	text-transform: uppercase;
	padding-bottom: 5px;
`;

const StyledCurrencyPrice = styled(CurrencyPrice)`
	justify-items: start;
	.price {
		margin-right: 8px;
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;
export default PriceItem;
