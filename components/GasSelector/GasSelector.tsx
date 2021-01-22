import React, { useEffect, useMemo } from 'react';

import styled from 'styled-components';
import { useRecoilState, useRecoilValue } from 'recoil';
import Tippy from '@tippyjs/react';

import { customGasPriceState, gasSpeedState } from 'store/wallet';
import { ESTIMATE_VALUE } from 'constants/placeholder';

import useEthGasStationQuery, { GasPrices, GAS_SPEEDS } from 'queries/network/useEthGasPriceQuery';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getTransactionPrice } from 'utils/network';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { isLayerOneState } from 'store/chain';

import { Synths } from 'constants/currency';
import { formatCurrency } from 'utils/formatters/number';
import NumericInput from 'components/Input/NumericInput';
import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import { FlexDivRow, FlexDivRowCentered, NumericValue, FlexDivCol } from 'styles/common';

type GasSelectorProps = {
	gasLimitEstimate: number | null;
	setGasPrice: Function;
	altVersion?: boolean;
};

const GasSelector: React.FC<GasSelectorProps> = ({
	gasLimitEstimate,
	setGasPrice,
	altVersion = false,
	...rest
}) => {
	const { t } = useTranslation();
	const [gasSpeed, setGasSpeed] = useRecoilState(gasSpeedState);
	const [customGasPrice, setCustomGasPrice] = useRecoilState(customGasPriceState);

	const isLayer1 = useRecoilValue(isLayerOneState);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasStationQuery = useEthGasStationQuery();

	const gasPrices = ethGasStationQuery.data ?? ({} as GasPrices);
	const exchangeRates = exchangeRatesQuery.data ?? null;

	const hasCustomGasPrice = customGasPrice !== '';

	const gasPrice = useMemo(() => {
		if (!isLayer1) return 0;
		return customGasPrice !== ''
			? Number(customGasPrice)
			: ethGasStationQuery.data != null
			? ethGasStationQuery.data[gasSpeed]
			: null;
	}, [isLayer1, customGasPrice, ethGasStationQuery.data, gasSpeed]);

	useEffect(() => {
		setGasPrice(
			isLayer1
				? customGasPrice !== ''
					? Number(customGasPrice)
					: ethGasStationQuery.data != null
					? ethGasStationQuery.data[gasSpeed]
					: null
				: 0
		);
		// eslint-disable-next-line
	}, [gasPrice, customGasPrice]);

	const ethPriceRate = getExchangeRatesForCurrencies(
		exchangeRates,
		Synths.sETH,
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

	const content = (
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
					variant="solid"
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
	);

	if (altVersion) {
		return (
			<GasPriceContainer>
				<GasPriceTooltip trigger="click" arrow={false} content={content} interactive={true}>
					<div>
						{t('common.gas-prices.est', {
							amount:
								transactionFee != null
									? `(${formatCurrency(selectedPriceCurrency.name, transactionFee, {
											sign: selectedPriceCurrency.sign,
									  })})`
									: '',
						})}
					</div>
				</GasPriceTooltip>
			</GasPriceContainer>
		);
	}

	return (
		<Container {...rest}>
			<FlexDivRow>
				<GasPriceHeader>{t('common.gas-header')}</GasPriceHeader>
				<FlexDivRowCentered>
					<GasPriceItem>
						<GasPriceText>
							{gasPriceItem}{' '}
							{transactionFee != null &&
								`(${formatCurrency(selectedPriceCurrency.name, transactionFee, {
									sign: selectedPriceCurrency.sign,
								})})`}
						</GasPriceText>
					</GasPriceItem>
					<GasPriceTooltip trigger="click" arrow={false} content={content} interactive={true}>
						<StyledGasEditButton disabled={!isLayer1} role="button">
							{t('common.edit')}
						</StyledGasEditButton>
					</GasPriceTooltip>
				</FlexDivRowCentered>
			</FlexDivRow>
			<OvmSubtext>{t('common.gas-prices.ovm')}</OvmSubtext>
		</Container>
	);
};

const Container = styled(FlexDivCol)`
	width: 100%;
	justify-content: space-between;
`;

const GasPriceContainer = styled(FlexDivRowCentered)`
	margin-top: 10px;
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.gray};
	padding: 2px 0;
	cursor: pointer;
	border-bottom: 1px dashed ${(props) => props.theme.colors.gray};
`;

const GasPriceHeader = styled.p`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.gray};
	text-transform: uppercase;
`;

const GasPriceText = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

const OvmSubtext = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.blue};
	margin: -6px 0 12px 0;
`;

const GasPriceTooltip = styled(Tippy)`
	background: ${(props) => props.theme.colors.navy};
	border: 0.5px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	width: 120px;
	.tippy-content {
		padding: 0;
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

const StyledGasEditButton = styled.span<{ disabled: boolean }>`
	font-family: ${(props) => props.theme.fonts.interBold};
	padding-left: 5px;
	font-size: 12px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.blue};
	text-transform: uppercase;
	opacity: ${(props) => (props.disabled ? 0.25 : 1)};
`;

export default GasSelector;
