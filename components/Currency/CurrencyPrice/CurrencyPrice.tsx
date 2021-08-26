import React, { FC } from 'react';
import styled from 'styled-components';

import ChangePercent from 'components/ChangePercent';

import { CurrencyKey } from 'constants/currency';

import { formatCurrency } from 'utils/formatters/number';

import { ContainerRow } from '../common';
import Wei, { wei } from '@synthetixio/wei';

type CurrencyPriceProps = {
	currencyKey: CurrencyKey;
	price: Wei | string | number;
	sign?: string;
	change?: number;
	conversionRate?: Wei | string | number | null;
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
					conversionRate != null ? wei(price).div(conversionRate) : price,
					{
						sign,
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
