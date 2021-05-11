import React, { FC } from 'react';
import styled from 'styled-components';
import BN from 'bn.js';

import { formatCurrency, NumericValue, toBigNumber } from 'utils/formatters/number';

import { CurrencyKey } from 'constants/currency';

import { ContainerRowMixin } from '../common';

type CurrencyAmountProps = {
	amountCurrencyKey: CurrencyKey;
	amount: NumericValue;
	valueCurrencyKey: CurrencyKey;
	totalValue: NumericValue;
	sign?: string;
	conversionRate?: BN | null;
};

export const CurrencyAmount: FC<CurrencyAmountProps> = ({
	amountCurrencyKey,
	amount,
	valueCurrencyKey,
	totalValue,
	sign,
	conversionRate,
	...rest
}) => (
	<Container {...rest}>
		<Amount className="amount">{formatCurrency(amountCurrencyKey, amount)}</Amount>
		<TotalValue className="total-value">
			{formatCurrency(
				valueCurrencyKey,
				conversionRate != null ? toBigNumber(totalValue).div(conversionRate) : totalValue,
				{ sign }
			)}
		</TotalValue>
	</Container>
);

const Container = styled.span`
	${ContainerRowMixin};
`;

const Amount = styled.span`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
`;
const TotalValue = styled.span`
	color: ${(props) => props.theme.colors.gray};
`;

export default CurrencyAmount;
