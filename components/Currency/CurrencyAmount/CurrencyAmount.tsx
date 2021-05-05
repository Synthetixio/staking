import React, { FC } from 'react';
import styled from 'styled-components';

import { formatCurrency, NumericValue, toBigNumber } from 'utils/formatters/number';

import { CurrencyKey } from 'constants/currency';

import { ContainerRow } from '../common';

type CurrencyAmountProps = {
	amountCurrencyKey: CurrencyKey;
	amount: NumericValue;
	valueCurrencyKey: CurrencyKey;
	totalValue: NumericValue;
	sign?: string;
	conversionRate?: NumericValue | null;
	showTotalValue?: boolean;
};

export const CurrencyAmount: FC<CurrencyAmountProps> = ({
	amountCurrencyKey,
	amount,
	valueCurrencyKey,
	totalValue,
	sign,
	conversionRate,
	showTotalValue = true,
	...rest
}) => (
	<Container {...rest}>
		<Amount className="amount">{formatCurrency(amountCurrencyKey, amount)}</Amount>
		{!showTotalValue ? null : (
			<TotalValue className="total-value">
				{formatCurrency(
					valueCurrencyKey,
					conversionRate != null ? toBigNumber(totalValue).dividedBy(conversionRate) : totalValue,
					{ sign }
				)}
			</TotalValue>
		)}
	</Container>
);

const Container = styled(ContainerRow)``;

const Amount = styled.span`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
`;
const TotalValue = styled.span`
	color: ${(props) => props.theme.colors.gray};
`;

export default CurrencyAmount;
