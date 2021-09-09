import React, { FC, ReactNode, useState } from 'react';
import Img, { Svg } from 'react-optimized-image';
import styled from 'styled-components';

import ETHIcon from 'assets/svg/currencies/crypto/ETH.svg';
import DeprecatedXIcon from 'assets/svg/app/deprecated-x.svg';

import { CryptoCurrency, CurrencyKey } from 'constants/currency';

import { FlexDivCentered } from 'styles/common';
import useSynthetixQueries from '@synthetixio/queries';
import { EXTERNAL_LINKS } from 'constants/links';

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
	isDeprecated?: boolean;
};

export const SNXIcon =
	'https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/snx/SNX.svg';

export const getSynthIcon = (currencyKey: CurrencyKey) =>
	`https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/synths/${currencyKey}.svg`;

export const CurrencyIconContainer: FC<CurrencyIconProps> = (props) => (
	<Container>
		<CurrencyIcon {...props} />
		{!props.isDeprecated ? null : (
			<DeprecatedXIconContainer>
				<Svg src={DeprecatedXIcon} />
			</DeprecatedXIconContainer>
		)}
	</Container>
);

export const CurrencyIcon: FC<CurrencyIconProps> = ({
	currencyKey,
	type,
	isDeprecated,
	...rest
}) => {
	const [firstFallbackError, setFirstFallbackError] = useState<boolean>(false);
	const [secondFallbackError, setSecondFallbackError] = useState<boolean>(false);
	const [thirdFallbackError, setThirdFallbackError] = useState<boolean>(false);

	const { useTokenListQuery } = useSynthetixQueries();

	const synthetixTokenListQuery = useTokenListQuery(EXTERNAL_LINKS.TokenLists.Synthetix);
	const synthetixTokenListMap = synthetixTokenListQuery.isSuccess
		? synthetixTokenListQuery.data?.tokensMap ?? null
		: null;

	const ZapperTokenListQuery = useTokenListQuery(EXTERNAL_LINKS.TokenLists.Zapper);
	const ZapperTokenListMap = ZapperTokenListQuery.isSuccess
		? ZapperTokenListQuery.data?.tokensMap ?? null
		: null;

	const OneInchTokenListQuery = useTokenListQuery(EXTERNAL_LINKS.TokenLists.OneInch);
	const OneInchTokenListMap = OneInchTokenListQuery.isSuccess
		? OneInchTokenListQuery.data?.tokensMap ?? null
		: null;

	const props = {
		width: '24px',
		height: '24px',
		alt: currencyKey,
		...rest,
	};

	if (!firstFallbackError) {
		switch (currencyKey) {
			case CryptoCurrency.ETH: {
				return <Img src={ETHIcon} {...props} />;
			}
			case CryptoCurrency.SNX: {
				return <img src={SNXIcon} {...props} alt="snx-icon" />;
			}
			default:
				return (
					<TokenIcon
						{...{ isDeprecated }}
						src={
							synthetixTokenListMap != null && synthetixTokenListMap[currencyKey] != null
								? synthetixTokenListMap[currencyKey].logoURI
								: getSynthIcon(currencyKey)
						}
						onError={() => setFirstFallbackError(true)}
						{...props}
						alt={currencyKey}
					/>
				);
		}
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
	} else if (
		ZapperTokenListMap != null &&
		ZapperTokenListMap[currencyKey] != null &&
		!thirdFallbackError
	) {
		return (
			<TokenIcon
				src={ZapperTokenListMap[currencyKey].logoURI}
				onError={() => setThirdFallbackError(true)}
				{...props}
			/>
		);
	} else {
		return (
			<Placeholder {...{ isDeprecated }} style={{ width: props.width, height: props.height }}>
				{currencyKey}
			</Placeholder>
		);
	}
};

const Container = styled.div`
	position: relative;
`;

const DeprecatedXIconContainer = styled.div`
	position: absolute;
	right: -3px;
	bottom: -3px;
`;

const Placeholder = styled(FlexDivCentered)<{ isDeprecated?: boolean }>`
	border-radius: 100%;
	color: ${(props) => props.theme.colors.white};
	border: 2px solid
		${(props) => (props.isDeprecated ? props.theme.colors.red : props.theme.colors.white)};
	font-size: 7px;
	font-family: ${(props) => props.theme.fonts.interBold};
	justify-content: center;
	margin: 0 auto;
`;

const TokenIcon = styled.img<{ isDeprecated?: boolean }>`
	border-radius: 100%;
	border: 2px solid ${(props) => (props.isDeprecated ? props.theme.colors.red : 'transparent')};
`;

export default CurrencyIconContainer;
