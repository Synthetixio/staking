import React, { FC, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';

type MintTabProps = {
	amountToStake: string;
	setAmountToStake: (amount: string) => void;
	mintLoadingState: LoadingState | null;
	setMintLoadingState: (state: LoadingState | null) => void;
	maxIssuabledSynthAmount: number;
	targetCRatio: number;
	snxPrice: number;
};

function getMintAmount(targetCRatio: number, stakeAmount: string, SNXPrice: number) {
	if (!stakeAmount || !targetCRatio || !SNXPrice) return '0';
	return Number(stakeAmount) * targetCRatio * SNXPrice;
}

const MintTab: FC<MintTabProps> = ({
	amountToStake,
	setAmountToStake,
	mintLoadingState,
	setMintLoadingState,
	maxIssuabledSynthAmount,
	targetCRatio,
	snxPrice,
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

	const handleMint = () => {
		setMintLoadingState(LoadingState.LOADING);
	};

	const handleStakeChange = (value: string) => setAmountToStake(value);

	const handleMaxIssuance = () => setAmountToStake(maxIssuabledSynthAmount?.toString() || '');

	return (
		<TabContainer>
			<HeaderBox>
				<p>{t('staking.actions.mint.info.header')}</p>
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
					value={amountToStake}
				/>
				<StyledButton onClick={handleMaxIssuance} variant="outline">
					Max
				</StyledButton>
			</InputBox>
			<DataContainer>
				<DataRow>
					<RowTitle>{t('staking.actions.mint.info.staking')}</RowTitle>
					<RowValue>
						{amountToStake} {stakeType.label}
					</RowValue>
				</DataRow>
				<DataRow>
					<RowTitle>{t('staking.actions.mint.info.minting')}</RowTitle>
					<RowValue>{getMintAmount(targetCRatio, amountToStake, snxPrice)} sUSD</RowValue>
				</DataRow>
			</DataContainer>
			{amountToStake !== '0' && amountToStake !== '' ? (
				<StyledCTA onClick={handleMint} variant="primary" size="lg" disabled={!!mintLoadingState}>
					{t('staking.actions.mint.action.mint', {
						amountToStake: amountToStake,
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

export default MintTab;
