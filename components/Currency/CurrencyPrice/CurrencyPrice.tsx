import React, { FC } from 'react';
import styled from 'styled-components';
import BN from 'bn.js';

import ChangePercent from 'components/ChangePercent';

import { CurrencyKey } from 'constants/currency';

import { formatBNFiatCurrency, zeroBN } from 'utils/formatters/number';

import { ContainerRowMixin } from '../common';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

type CurrencyPriceProps = {
	currencyKey: CurrencyKey;
	price: BN;
	sign?: string;
	change?: number;
	conversionRate?: BN | null;
};

export const CurrencyPrice: FC<CurrencyPriceProps> = ({
	currencyKey,
	price,
	sign,
	change,
	conversionRate,
	...rest
}) => {
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	return (
		<Container {...rest}>
			<Price className="price">
				{formatBNFiatCurrency(getPriceAtCurrentRate(price || zeroBN), {
					sign: selectedPriceCurrency.sign,
				})}
			</Price>
			{change != null && <ChangePercent className="percent" value={change} />}
		</Container>
	);
};

const Container = styled.span`
	${ContainerRowMixin};
	color: ${(props) => props.theme.colors.white};
`;

const Price = styled.span`
	font-family: ${(props) => props.theme.fonts.mono};
`;

export default CurrencyPrice;
