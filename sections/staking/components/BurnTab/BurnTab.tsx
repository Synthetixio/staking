import React, { useMemo, useState } from 'react';
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

type BurnTabProps = {
	amountToBurn: string | null;
	setAmountToBurn: (amount: string) => void;
	burnLoadingState: LoadingState | null;
	setBurnLoadingState: (state: LoadingState | null) => void;
	maxBurnAmount: number;
	targetCRatio: number;
	snxPrice: number;
	stakedSNX: number;
};

const BurnTab: React.FC<BurnTabProps> = ({
	amountToBurn,
	setAmountToBurn,
	burnLoadingState,
	setBurnLoadingState,
	maxBurnAmount,
	targetCRatio,
	snxPrice,
	stakedSNX,
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
		setBurnLoadingState(LoadingState.LOADING);
	};

	const handleStakeChange = (value: string) => setAmountToBurn(value);

	const handleMaxIssuance = () => setAmountToBurn(maxBurnAmount?.toString() || '');
	return (
		<TabContainer>
			<HeaderBox>
				<p>{t('staking.actions.burn.info.header')}</p>

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
					value={amountToBurn ?? '0'}
				/>
				<StyledButton onClick={handleMaxIssuance} variant="outline">
					Max
				</StyledButton>
			</InputBox>
			<DataContainer>
				<DataRow>
					<RowTitle>{t('staking.actions.burn.info.burning')}</RowTitle>
					<RowValue>{amountToBurn ? amountToBurn : '0'} sUSD</RowValue>
				</DataRow>
				<DataRow>
					<RowTitle>{t('staking.actions.burn.info.unstaking')}</RowTitle>
					<RowValue>
						{maxBurnAmount === Number(amountToBurn) ? stakedSNX : 0} {stakeType.label}
					</RowValue>
				</DataRow>
			</DataContainer>
			{amountToBurn !== '' ? (
				<StyledCTA onClick={handleMint} variant="primary" size="lg" disabled={!!burnLoadingState}>
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
