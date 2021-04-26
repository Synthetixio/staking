import React, { FC, useState } from 'react';
import Img from 'react-optimized-image';
import styled from 'styled-components';

import ETHIcon from 'assets/svg/currencies/crypto/ETH.svg';

import { CryptoCurrency, CurrencyKey } from 'constants/currency';

import useSynthetixTokenList from 'queries/tokenLists/useSynthetixTokenList';
import useZapperTokenList from 'queries/tokenLists/useZapperTokenList';
import { FlexDivCentered } from 'styles/common';

type CurrencyIconProps = {
	currencyKey: CurrencyKey;
	type?: 'synth' | 'asset' | 'token';
	className?: string;
	width?: string;
	height?: string;
};

export const SNXIcon =
	'https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/snx/SNX.svg';

export const getSynthIcon = (currencyKey: CurrencyKey) =>
	`https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/synths/${currencyKey}.svg`;

export const CurrencyIcon: FC<CurrencyIconProps> = ({ currencyKey, type, ...rest }) => {
	const [isError, setIsError] = useState<boolean>(false);

	const synthetixTokenListQuery = useSynthetixTokenList();
	const synthetixTokenListMap = synthetixTokenListQuery.isSuccess
		? synthetixTokenListQuery.data?.tokensMap ?? null
		: null;

	const ZapperTokenListQuery = useZapperTokenList();
	const ZapperTokenListMap = ZapperTokenListQuery.isSuccess
		? ZapperTokenListQuery.data?.tokensMap ?? null
		: null;

	const props = {
		width: '24px',
		height: '24px',
		alt: currencyKey,
		...rest,
	};

	const defaultIcon = (
		<Placeholder style={{ width: props.width, height: props.height }}>{currencyKey}</Placeholder>
	);

	if (isError) {
		return defaultIcon;
	}

	if (type === 'token') {
		return ZapperTokenListMap != null && ZapperTokenListMap[currencyKey] != null ? (
			<ZapperTokenIcon
				src={ZapperTokenListMap[currencyKey].logoURI}
				onError={() => setIsError(true)}
				{...props}
			/>
		) : (
			defaultIcon
		);
	} else {
		switch (currencyKey) {
			case CryptoCurrency.ETH: {
				return <Img src={ETHIcon} {...props} />;
			}
			case CryptoCurrency.SNX: {
				return <img src={SNXIcon} {...props} />;
			}
			default:
				return (
					<img
						src={
							synthetixTokenListMap != null && synthetixTokenListMap[currencyKey] != null
								? synthetixTokenListMap[currencyKey].logoURI
								: getSynthIcon(currencyKey)
						}
						onError={() => setIsError(true)}
						{...props}
					/>
				);
		}
	}
};

// 		case LP.BALANCER_sTSLA: {
// 			return <Img src={sTSLAIcon} {...props} />;
// 		}
// 		case LP.BALANCER_sFB: {
// 			return <Img src={sFBIcon} {...props} />;
// 		}
// 		case LP.BALANCER_sAAPL: {
// 			return <Img src={sAAPLIcon} {...props} />;
// 		}
// 		case LP.BALANCER_sAMZN: {
// 			return <Img src={sAMZNIcon} {...props} />;
// 		}
// 		case LP.BALANCER_sNFLX: {
// 			return <Img src={sNFLXIcon} {...props} />;
// 		}
// 		case LP.BALANCER_sGOOG: {
// 			return <Img src={sGOOGIcon} {...props} />;
// 		}
// 		case LP.CURVE_sUSD: {
// 			return <Img src={sUSDIcon} {...props} />;
// 		}
// 		case LP.CURVE_sEURO: {
// 			return <Img src={sEURIcon} {...props} />;
// 		}
// 		case LP.UNISWAP_DHT: {
// 			return <Img src={DHTIcon} {...props} />;
// 		}
// 		default:
// 			return null;
// 	}
// };

const Placeholder = styled(FlexDivCentered)`
	border-radius: 100%;
	color: ${(props) => props.theme.colors.white};
	border: 1px solid ${(props) => props.theme.colors.white};
	font-size: 7px;
	font-family: ${(props) => props.theme.fonts.interBold};
	justify-content: center;
	margin: 0 auto;
`;

const ZapperTokenIcon = styled.img`
	border-radius: 100%;
`;

export default CurrencyIcon;
