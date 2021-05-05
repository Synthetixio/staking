import React, { FC } from 'react';
import styled from 'styled-components';

import ChangePercent from 'components/ChangePercent';

import { CurrencyKey } from 'constants/currency';

import { formatCurrency, NumericValue, toBigNumber } from 'utils/formatters/number';

import { ContainerRow } from '../common';
import { DEFAULT_FIAT_DECIMALS } from 'constants/defaults';

type CurrencyPriceProps = {
	currencyKey: CurrencyKey;
	price: NumericValue;
	sign?: string;
	change?: number;
	conversionRate?: NumericValue | null;
};

export const CurrencyPrice: FC<CurrencyPriceProps> = ({
	currencyKey,
	price,
	sign,
	change,
	conversionRate,
	...rest
}) => {
	return (
		<Container {...rest}>
			<Price className="price">
				{formatCurrency(
					currencyKey,
					conversionRate != null ? toBigNumber(price).dividedBy(conversionRate) : price,
					{
						sign,
						decimals: DEFAULT_FIAT_DECIMALS,
					}
				)}
			</Price>
			{change != null && <ChangePercent className="percent" value={change} />}
		</Container>
	);
};

const Container = styled(ContainerRow)`
	color: ${(props) => props.theme.colors.white};
`;

const Price = styled.span`
	font-family: ${(props) => props.theme.fonts.mono};
`;

export default CurrencyPrice;
