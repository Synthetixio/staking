import React, { FC, useState } from 'react';
import Img from 'react-optimized-image';
import styled from 'styled-components';

import ETHIcon from 'assets/svg/currencies/crypto/ETH.svg';

import { CryptoCurrency, CurrencyKey } from 'constants/currency';

import useSynthetixTokenList from 'queries/tokenLists/useSynthetixTokenList';
import useZapperTokenList from 'queries/tokenLists/useZapperTokenList';
import useOneInchTokenList from 'queries/tokenLists/useOneInchTokenList';

import { FlexDivCentered } from 'styles/common';

export enum CurrencyIconType {
	SYNTH = 'synth',
	ASSET = 'asset',
	TOKEN = 'token',
}

type CurrencyIconProps = {
	currencyKey: CurrencyKey;
	type?: CurrencyIconType;
	className?: string;
	width?: string;
	height?: string;
};

export const SNXIcon =
	'https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/snx/SNX.svg';

export const getSynthIcon = (currencyKey: CurrencyKey) =>
	`https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/synths/${currencyKey}.svg`;

export const CurrencyIcon: FC<CurrencyIconProps> = ({ currencyKey, type, ...rest }) => {
	const [error, setError] = useState<boolean>(false);
	const [firstFallbackError, setFirstFallbackError] = useState<boolean>(false);
	const [secondFallbackError, setSecondFallbackError] = useState<boolean>(false);

	const synthetixTokenListQuery = useSynthetixTokenList();
	const synthetixTokenListMap = synthetixTokenListQuery.isSuccess
		? synthetixTokenListQuery.data?.tokensMap ?? null
		: null;

	const ZapperTokenListQuery = useZapperTokenList();
	const ZapperTokenListMap = ZapperTokenListQuery.isSuccess
		? ZapperTokenListQuery.data?.tokensMap ?? null
		: null;

	const OneInchTokenListQuery = useOneInchTokenList();
	const OneInchTokenListMap = OneInchTokenListQuery.isSuccess
		? OneInchTokenListQuery.data?.tokensMap ?? null
		: null;

	const props = {
		width: '36px',
		height: '36px',
		alt: currencyKey,
		...rest,
	};

	const defaultIcon = (
		<Placeholder style={{ width: props.width, height: props.height }}>{currencyKey}</Placeholder>
	);

	if (type === 'token') {
		if (
			ZapperTokenListMap != null &&
			ZapperTokenListMap[currencyKey] != null &&
			!firstFallbackError
		) {
			return (
				<TokenIcon
					src={ZapperTokenListMap[currencyKey].logoURI}
					onError={() => setFirstFallbackError(true)}
					{...props}
				/>
			);
		} else if (
			OneInchTokenListMap != null &&
			OneInchTokenListMap[currencyKey] != null &&
			!secondFallbackError
		) {
			return (
				<TokenIcon
					src={OneInchTokenListMap[currencyKey].logoURI}
					onError={() => setSecondFallbackError(true)}
					{...props}
				/>
			);
		} else {
			return defaultIcon;
		}
	} else {
		if (error) return defaultIcon;
		switch (currencyKey) {
			case CryptoCurrency.ETH: {
				return <Img src={ETHIcon} {...props} />;
			}
			case CryptoCurrency.SNX: {
				return <img src={SNXIcon} {...props} alt="snx-icon" />;
			}
			default:
				return (
					<img
						src={
							synthetixTokenListMap != null && synthetixTokenListMap[currencyKey] != null
								? synthetixTokenListMap[currencyKey].logoURI
								: getSynthIcon(currencyKey)
						}
						onError={() => setError(true)}
						{...props}
						alt={currencyKey}
					/>
				);
		}
	}
};

const Placeholder = styled(FlexDivCentered)`
	border-radius: 100%;
	color: ${(props) => props.theme.colors.white};
	border: 1px solid ${(props) => props.theme.colors.white};
	font-size: 7px;
	font-family: ${(props) => props.theme.fonts.interBold};
	justify-content: center;
	margin: 0 auto;
`;

const TokenIcon = styled.img`
	border-radius: 100%;
`;

export default CurrencyIcon;
