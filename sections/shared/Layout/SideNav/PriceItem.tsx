import React, { FC } from 'react';
import styled from 'styled-components';
import { Trans } from 'react-i18next';

import { FlexDivCentered, FlexDivCol, FlexDivRowCentered, NoTextTransform } from 'styles/common';

import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';
import CurrencyPrice from 'components/Currency/CurrencyPrice';
import ChangePercent from 'components/ChangePercent';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useHistoricalRatesQuery from 'queries/rates/useHistoricalRatesQuery';

import { Period } from 'constants/period';

import LineChart, { LineChartData } from './LineChart';

type PriceItemProps = {
	currencyKey: CurrencyKey;
	data: LineChartData;
};

const PriceItem: FC<PriceItemProps> = ({ currencyKey, data }) => {
	const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const historicalRates = useHistoricalRatesQuery(currencyKey, Period.ONE_DAY);

	const exchangeRates = exchangeRatesQuery.data ?? null;
	const price = exchangeRates && exchangeRates[currencyKey];
	const trendLinePositive = data.length > 0 ? data[data.length - 1].value >= data[0].value : false;

	return (
		<Container>
			<Title>
				<span>
					<Trans
						i18nKey="common.currency.currency-price"
						values={{ currencyKey }}
						components={[<NoTextTransform />]}
					/>
				</span>
				{data.length > 0 ? (
					<FlexDivCentered>
						{historicalRates.data?.change && (
							<PercentChange>
								<ChangePercent className="percent" value={historicalRates.data?.change} />
							</PercentChange>
						)}
					</FlexDivCentered>
				) : (
					<div>{NO_VALUE}</div>
				)}
			</Title>
			<PriceInfo>
				{price != null ? (
					<StyledCurrencyPrice
						currencyKey={currencyKey}
						price={price}
						sign={selectedPriceCurrency.sign}
						conversionRate={selectPriceCurrencyRate}
					/>
				) : (
					<div>{NO_VALUE}</div>
				)}
			</PriceInfo>
			<LineChart data={data} trendLinePositive={trendLinePositive} currencyKey={currencyKey} />
		</Container>
	);
};

const Container = styled(FlexDivCol)`
	width: 100%;
	font-size: 12px;
	margin-bottom: 18px;
	&:last-child {
		padding-bottom: 0;
	}
`;

const Title = styled(FlexDivRowCentered)`
	font-family: ${(props) => props.theme.fonts.interBold};
	color: ${(props) => props.theme.colors.gray};
	text-transform: uppercase;
	padding-bottom: 5px;
`;

const StyledCurrencyPrice = styled(CurrencyPrice)`
	justify-items: start;
	.price {
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

const PriceInfo = styled(FlexDivCentered)`
	font-family: ${(props) => props.theme.fonts.mono};
	justify-content: space-between;
`;

const PercentChange = styled.div`
	font-size: 10px;
	font-family: ${(props) => props.theme.fonts.interBold};
`;

export default PriceItem;
