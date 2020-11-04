import React, { FC, useMemo, useState } from 'react';
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

type MintTabProps = {
	amountToStake: string | null;
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
	const stakeTypes = useMemo(
		() => [
			{
				label: 'SNX',
				key: 'SNX',
			},
			{
				label: 'ETH',
				key: 'ETH',
			},
			{
				label: 'BTC',
				key: 'BTC',
			},
		],
		[]
	);
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
					formatOptionLabel={(option: any) => option.label}
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
					value={amountToStake ?? '0'}
				/>
				<StyledButton onClick={handleMaxIssuance} variant="outline">
					Max
				</StyledButton>
			</InputBox>
			<DataContainer>
				<DataRow>
					<RowTitle>{t('staking.actions.mint.info.staking')}</RowTitle>
					<RowValue>
						{amountToStake ? amountToStake : '0'} {stakeType.label}
					</RowValue>
				</DataRow>
				<DataRow>
					<RowTitle>{t('staking.actions.mint.info.minting')}</RowTitle>
					<RowValue>{getMintAmount(targetCRatio, amountToStake ?? '0', snxPrice)} sUSD</RowValue>
				</DataRow>
			</DataContainer>
			{amountToStake ? (
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
