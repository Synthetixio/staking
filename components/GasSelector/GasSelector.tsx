import React, { useMemo } from 'react';

import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import Tippy from '@tippyjs/react';
import { Svg } from 'react-optimized-image';

import { customGasPriceState, gasSpeedState } from 'store/wallet';
import { ESTIMATE_VALUE } from 'constants/placeholder';

import useEthGasStationQuery, { GAS_SPEEDS } from 'queries/network/useEthGasPriceQuery';
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
import { FlexDivRow, NumericValue } from 'styles/common';

interface GasSelectorProps {
	gasLimitEstimate: number | null;
}

const GasSelector: React.FC<GasSelectorProps> = ({ gasLimitEstimate }) => {
	const { t } = useTranslation();

	const exchangeRatesQuery = useExchangeRatesQuery();

	const [gasSpeed, setGasSpeed] = useRecoilState(gasSpeedState);
	const [customGasPrice, setCustomGasPrice] = useRecoilState(customGasPriceState);
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasStationQuery = useEthGasStationQuery();
	const gasPrices = ethGasStationQuery.data ?? [];
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
		<GasPriceContainer>
			{gasPrice != null && (
				<>
					{transactionFee != null ? (
						<GasPriceCostTooltip
							content={
								<span>
									{formatCurrency(selectedPriceCurrency.name, transactionFee, {
										sign: selectedPriceCurrency.sign,
									})}
								</span>
							}
							arrow={false}
						>
							<GasPriceItem>
								{gasPriceItem}
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
										variant="alt"
										onClick={() => {
											setCustomGasPrice('');
											setGasSpeed(speed);
										}}
										isActive={hasCustomGasPrice ? false : gasSpeed === speed}
									>
										<span>{t(`common.gas-prices.${speed}`)}</span>
										<NumericValue>{gasPrices![speed]}</NumericValue>
									</StyedGasButton>
								))}
							</GasSelectContainer>
						}
						interactive={true}
					>
						<StyledGasEditButton role="button">{t('common.edit')}</StyledGasEditButton>
					</GasPriceTooltip>
				</>
			)}
		</GasPriceContainer>
	);
};

export default GasSelector;

const GasPriceContainer = styled(FlexDivRow)``;

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
	color: ${(props) => props.theme.colors.goldColors.color3};
	text-transform: uppercase;
`;
