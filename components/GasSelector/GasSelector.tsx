import React, { useEffect, useMemo } from 'react';

import styled from 'styled-components';
import { useRecoilState, useRecoilValue } from 'recoil';
import Tippy from '@tippyjs/react';

import { customGasPriceState, gasSpeedState, isL2State } from 'store/wallet';
import { ESTIMATE_VALUE } from 'constants/placeholder';
import { GasLimitEstimate } from 'constants/network';

import useSynthetixQueries, { GasPrices, GAS_SPEEDS } from '@synthetixio/queries';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getTransactionPrice } from 'utils/network';
import { getExchangeRatesForCurrencies } from 'utils/currencies';

import { Synths } from 'constants/currency';
import { formatCurrency } from 'utils/formatters/number';
import NumericInput from 'components/Input/NumericInput';
import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import { FlexDivRow, FlexDivRowCentered, NumericValue } from 'styles/common';
import { Svg } from 'react-optimized-image';
import Info from 'assets/svg/app/info.svg';
import { wei } from '@synthetixio/wei';

type GasSelectorProps = {
	gasLimitEstimate: GasLimitEstimate;
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
	const isL2 = useRecoilValue(isL2State);

	const { useExchangeRatesQuery, useEthGasPriceQuery } = useSynthetixQueries();

	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const ethGasStationQuery = useEthGasPriceQuery();

	const gasPrices = ethGasStationQuery.data ?? ({} as GasPrices);
	const exchangeRates = exchangeRatesQuery.data ?? null;

	const hasCustomGasPrice = customGasPrice !== '';

	const gasPrice = useMemo(() => {
		try {
			return wei(customGasPrice, 9);
		} catch (_) {
			return ethGasStationQuery.data != null ? wei(ethGasStationQuery.data[gasSpeed], 9) : null;
		}
	}, [customGasPrice, ethGasStationQuery.data, gasSpeed]);

	useEffect(() => {
		try {
			setGasPrice(wei(customGasPrice, 9));
		} catch (_) {
			setGasPrice(
				ethGasStationQuery.data != null ? wei(ethGasStationQuery.data[gasSpeed], 9) : null
			);
		}
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
			<div>
				<CustomGasPrice
					value={customGasPrice}
					onChange={(_, value) => setCustomGasPrice(value)}
					placeholder={t('common.custom')}
					data-testid="edit-gas-price-input"
				/>
			</div>
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
				{isL2 ? (
					<GasPriceTooltip
						arrow={false}
						content={t('common.layer-2.gas-fee-info')}
						interactive={true}
					>
						<span>
							<ResizedInfoIcon src={Info} />
						</span>
					</GasPriceTooltip>
				) : (
					<GasPriceTooltip trigger="click" arrow={false} content={content} interactive={true}>
						<StyledGasEditButton role="button" data-testid="edit-gas-price-button">
							{t('common.edit')}
						</StyledGasEditButton>
					</GasPriceTooltip>
				)}
			</FlexDivRowCentered>
		</Container>
	);
};

const Container = styled(FlexDivRow)`
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

const GasPriceTooltip = styled(Tippy)`
	background: ${(props) => props.theme.colors.navy};
	border: 0.5px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	width: 120px;
`;

const GasSelectContainer = styled.div`
	padding: 16px 0 8px 0;
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
	svg {
		margin-left: 5px;
	}
`;

const StyledGasEditButton = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	padding-left: 5px;
	font-size: 12px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.blue};
	text-transform: uppercase;
`;

const ResizedInfoIcon = styled(Svg)`
	transform: translateX(2px);
	cursor: pointer;
`;

export default GasSelector;
