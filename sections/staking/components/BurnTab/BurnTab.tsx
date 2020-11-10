import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingState } from 'constants/loading';
import {
	HeaderBox,
	StyledSelect,
	TabContainer,
	StyledButton,
	StyledCTA,
	StyledInput,
	DataContainer,
	DataRow,
	InputBox,
	RowTitle,
	RowValue,
} from '../common';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';

type BurnTabProps = {
	amountToBurn: string;
	setAmountToBurn: (amount: string) => void;
	burnLoadingState: LoadingState | null;
	maxBurnAmount: number;
	targetCRatio: number;
	snxPrice: number;
	stakedSNX: number;
	handleBurn: (burnToTarget: boolean) => void;
};

const BurnTab: React.FC<BurnTabProps> = ({
	amountToBurn,
	setAmountToBurn,
	burnLoadingState,
	maxBurnAmount,
	targetCRatio,
	snxPrice,
	stakedSNX,
	handleBurn,
}) => {
	const { t } = useTranslation();
	const stakeTypes = [
		{
			label: CRYPTO_CURRENCY_MAP.SNX,
			key: CRYPTO_CURRENCY_MAP.SNX,
		},
		{
			label: CRYPTO_CURRENCY_MAP.ETH,
			key: CRYPTO_CURRENCY_MAP.ETH,
		},
		{
			label: CRYPTO_CURRENCY_MAP.BTC,
			key: CRYPTO_CURRENCY_MAP.BTC,
		},
	];
	const [stakeType, setStakeType] = useState(stakeTypes[0]);

	const handleStakeChange = (value: string) => setAmountToBurn(value);

	const handleMaxIssuance = () => setAmountToBurn(maxBurnAmount?.toString() || '');

	return (
		<TabContainer>
			<HeaderBox>
				<p>{t('staking.actions.burn.info.header')}</p>
				<StyledSelect
					inputId="mint-type-list"
					formatOptionLabel={(option: { value: string; label: string }) => option.label}
					options={stakeTypes}
					value={stakeType}
					onChange={(option: any) => {
						if (option) {
							setStakeType(option);
						}
					}}
				/>
			</HeaderBox>
			<InputBox>
				<StyledInput
					placeholder="0"
					onChange={(e) => handleStakeChange(e.target.value)}
					value={amountToBurn}
				/>
				<StyledButton onClick={handleMaxIssuance} variant="outline">
					Max
				</StyledButton>
			</InputBox>
			<DataContainer>
				<DataRow>
					<RowTitle>{t('staking.actions.burn.info.burning')}</RowTitle>
					<RowValue>{amountToBurn} sUSD</RowValue>
				</DataRow>
				<DataRow>
					<RowTitle>{t('staking.actions.burn.info.unstaking')}</RowTitle>
					<RowValue>
						{maxBurnAmount === Number(amountToBurn) ? stakedSNX : 0} {stakeType.label}
					</RowValue>
				</DataRow>
			</DataContainer>
			{amountToBurn !== '0' && amountToBurn !== '' ? (
				// TODO: fix this tsc err
				// @ts-ignore
				<StyledCTA onClick={handleBurn} variant="primary" size="lg" disabled={!!burnLoadingState}>
					{t('staking.actions.burn.action.burn', {
						amountToBurn: amountToBurn,
						stakeType: stakeType.label,
					})}
				</StyledCTA>
			) : (
				<StyledCTA variant="primary" size="lg" disabled={true}>
					{t('staking.actions.mint.action.empty')}
				</StyledCTA>
			)}
		</TabContainer>
	);
};

export default BurnTab;
