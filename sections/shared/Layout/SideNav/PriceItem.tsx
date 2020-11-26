import styled from 'styled-components';
import { FC } from 'react';
import { Trans } from 'react-i18next';

import { FlexDivCentered, FlexDivCol, NoTextTransform } from 'styles/common';

import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';
import CurrencyPrice from 'components/Currency/CurrencyPrice';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import LineChart, { LineChartData } from './LineChart';
import { formatPercent } from 'utils/formatters/number';

type PriceItemProps = {
	currencyKey: CurrencyKey;
	data: LineChartData;
};

const PriceItem: FC<PriceItemProps> = ({ currencyKey, data }) => {
	const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const exchangeRates = exchangeRatesQuery.data ?? null;
	const price = exchangeRates && exchangeRates[currencyKey];
	const trendLinePositive = data.length > 0 ? data[data.length - 1].value >= data[0].value : false;

	return (
		<Container>
			<Title>
				<Trans
					i18nKey="common.currency.currency-price"
					values={{ currencyKey }}
					components={[<NoTextTransform />]}
				/>
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
				{data.length > 0 ? (
					<FlexDivCentered>
						{trendLinePositive ? <TriangleUp /> : <TriangleDown />}
						<PercentChange trendLinePositive={trendLinePositive}>
							{formatPercent(data[data.length - 1].value / data[0].value - 1)}
						</PercentChange>
					</FlexDivCentered>
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
	font-size: 10px;
	padding-bottom: 20px;
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
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

const PriceInfo = styled(FlexDivCentered)`
	font-family: ${(props) => props.theme.fonts.mono};
	justify-content: space-between;
`;

const PercentChange = styled.div<{ trendLinePositive: boolean }>`
	font-size: 10px;
	color: ${(props) =>
		props.trendLinePositive ? props.theme.colors.brightGreen : props.theme.colors.brightPink};
`;

const TriangleUp = styled.div`
	border-left: 4px solid transparent;
	border-right: 4px solid transparent;
	border-bottom: ${(props) => `calc(2 * 4px * 0.866) solid ${props.theme.colors.brightGreen}`};
	border-top: 4px solid transparent;
	display: inline-block;
	margin-bottom: 4px;
	margin-right: 4px;
`;

const TriangleDown = styled.div`
	border-left: 4px solid transparent;
	border-right: 4px solid transparent;
	border-top: ${(props) => `calc(2 * 4px * 0.866) solid ${props.theme.colors.brightPink}`};
	border-bottom: 4px solid transparent;
	display: inline-block;
	margin-bottom: -5px;
	margin-right: 4px;
`;
export default PriceItem;
