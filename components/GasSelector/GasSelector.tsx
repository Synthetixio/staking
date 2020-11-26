import React, { useEffect, useMemo } from 'react';

import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import Tippy from '@tippyjs/react';
import { Svg } from 'react-optimized-image';

import { customGasPriceState, gasSpeedState } from 'store/wallet';
import { ESTIMATE_VALUE } from 'constants/placeholder';

import useEthGasStationQuery, { GasPrices, GAS_SPEEDS } from 'queries/network/useEthGasPriceQuery';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getTransactionPrice } from 'utils/network';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { SYNTHS_MAP } from 'constants/currency';
import InfoIcon from 'assets/svg/app/info.svg';
import { formatCurrency } from 'utils/formatters/number';
import NumericInput from 'components/Input/NumericInput';
import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import { FlexDivCol, FlexDivRow, FlexDivRowCentered, NumericValue } from 'styles/common';

interface GasSelectorProps {
	gasLimitEstimate: number | null;
	setGasPrice: Function;
}

const GasSelector: React.FC<GasSelectorProps> = ({ gasLimitEstimate, setGasPrice, ...rest }) => {
	const { t } = useTranslation();
	const [gasSpeed, setGasSpeed] = useRecoilState(gasSpeedState);
	const [customGasPrice, setCustomGasPrice] = useRecoilState(customGasPriceState);

	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasStationQuery = useEthGasStationQuery();

	const gasPrices = ethGasStationQuery.data ?? ({} as GasPrices);
	const exchangeRates = exchangeRatesQuery.data ?? null;

	const hasCustomGasPrice = customGasPrice !== '';

	const gasPrice = useMemo(
		() =>
			customGasPrice !== ''
				? Number(customGasPrice)
				: ethGasStationQuery.data != null
				? ethGasStationQuery.data[gasSpeed]
				: null,
		[customGasPrice, ethGasStationQuery.data, gasSpeed]
	);

	useEffect(() => {
		setGasPrice(
			customGasPrice !== ''
				? Number(customGasPrice)
				: ethGasStationQuery.data != null
				? ethGasStationQuery.data[gasSpeed]
				: null
		);
		// eslint-disable-next-line
	}, [gasPrice, customGasPrice]);

	const ethPriceRate = getExchangeRatesForCurrencies(
		exchangeRates,
		SYNTHS_MAP.sETH,
		selectedPriceCurrency.name
	);

	const transactionFee = useMemo(
		() => getTransactionPrice(gasPrice, gasLimitEstimate, ethPriceRate),
		[gasPrice, gasLimitEstimate, ethPriceRate]
	);

	const gasPriceItem = hasCustomGasPrice ? (
		<span>{Number(customGasPrice)}</span>
	) : (
		<span>
			{ESTIMATE_VALUE} {gasPrice}
		</span>
	);

	return (
		<Container {...rest}>
			<GasPriceHeader>{t('common.gas-header')}</GasPriceHeader>
			<GasPriceContainer>
				{transactionFee != null ? (
					<GasPriceCostTooltip
						content={
							<GasPriceText>
								{formatCurrency(selectedPriceCurrency.name, transactionFee, {
									sign: selectedPriceCurrency.sign,
								})}
							</GasPriceText>
						}
						arrow={false}
					>
						<GasPriceItem>
							<GasPriceText>{gasPriceItem}</GasPriceText>
							<Svg src={InfoIcon} />
						</GasPriceItem>
					</GasPriceCostTooltip>
				) : (
					gasPriceItem
				)}
				<GasPriceTooltip
					trigger="click"
					arrow={false}
					content={
						<GasSelectContainer>
							<CustomGasPriceContainer>
								<CustomGasPrice
									value={customGasPrice}
									onChange={(_, value) => setCustomGasPrice(value)}
									placeholder={t('common.custom')}
								/>
							</CustomGasPriceContainer>
							{GAS_SPEEDS.map((speed) => (
								<StyedGasButton
									key={speed}
									variant="outline"
									onClick={() => {
										setCustomGasPrice('');
										setGasSpeed(speed);
									}}
									isActive={hasCustomGasPrice ? false : gasSpeed === speed}
								>
									<GasPriceText>{t(`common.gas-prices.${speed}`)}</GasPriceText>
									<NumericValue>{gasPrices![speed]}</NumericValue>
								</StyedGasButton>
							))}
						</GasSelectContainer>
					}
					interactive={true}
				>
					<StyledGasEditButton role="button">{t('common.edit')}</StyledGasEditButton>
				</GasPriceTooltip>
			</GasPriceContainer>
		</Container>
	);
};

export default GasSelector;

const Container = styled(FlexDivRow)`
	width: 100%;
	justify-content: space-between;
`;

const GasPriceContainer = styled(FlexDivRowCentered)``;

const GasPriceHeader = styled.p`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.gray10};
	text-transform: uppercase;
`;

const GasPriceText = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

const GasPriceTooltip = styled(Tippy)`
	background: ${(props) => props.theme.colors.elderberry};
	border: 0.5px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	width: 120px;
	.tippy-content {
		padding: 0;
	}
`;

const GasPriceCostTooltip = styled(GasPriceTooltip)`
	width: auto;
	font-size: 12px;
	.tippy-content {
		padding: 5px;
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

const GasSelectContainer = styled.div`
	padding: 16px 0 8px 0;
`;

const CustomGasPriceContainer = styled.div`
	margin: 0 10px 5px 10px;
`;

const CustomGasPrice = styled(NumericInput)`
	width: 100%;
	border: 0;
	font-size: 12px;
	::placeholder {
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

const StyedGasButton = styled(Button)`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-left: 10px;
	padding-right: 10px;
	font-size: 12px;
`;

const GasPriceItem = styled.span`
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	svg {
		margin-left: 5px;
	}
`;

const StyledGasEditButton = styled.span`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	padding-left: 5px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.brightBlue};
	text-transform: uppercase;
`;
