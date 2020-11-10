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
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import { getMintAmount } from '../helper';
import { formatCurrency } from 'utils/formatters/number';

type MintTabProps = {
	amountToStake: string;
	setAmountToStake: (amount: string) => void;
	mintLoadingState: LoadingState | null;
	maxCollateral: number;
	targetCRatio: number;
	snxPrice: number;
	handleStake: () => void;
};

const MintTab: FC<MintTabProps> = ({
	amountToStake,
	setAmountToStake,
	mintLoadingState,
	maxCollateral,
	targetCRatio,
	snxPrice,
	handleStake,
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

	const handleStakeChange = (value: string) => setAmountToStake(value);

	const handleMaxIssuance = () => setAmountToStake(maxCollateral?.toString() || '');

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
						{formatCurrency(stakeType.label, amountToStake, {
							currencyKey: stakeType.label,
						})}
					</RowValue>
				</DataRow>
				<DataRow>
					<RowTitle>{t('staking.actions.mint.info.minting')}</RowTitle>
					<RowValue>
						{formatCurrency(SYNTHS_MAP.sUSD, getMintAmount(targetCRatio, amountToStake, snxPrice), {
							currencyKey: SYNTHS_MAP.sUSD,
						})}
					</RowValue>
				</DataRow>
			</DataContainer>
			{amountToStake !== '0' && amountToStake !== '' ? (
				<StyledCTA onClick={handleStake} variant="primary" size="lg" disabled={!!mintLoadingState}>
					{t('staking.actions.mint.action.mint', {
						amountToStake: formatCurrency(stakeType.label, amountToStake, {
							currencyKey: stakeType.label,
						}),
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
