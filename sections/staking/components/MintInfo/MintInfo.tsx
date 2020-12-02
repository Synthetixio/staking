import React, { useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
	Title,
	Subtitle,
	DataContainer,
	DataRow,
	RowTitle,
	RowValue,
	ValueContainer,
	StyledLink,
} from '../common';
import { Svg } from 'react-optimized-image';
import Arrows from 'assets/svg/app/arrows.svg';
import { formatCurrency } from 'utils/formatters/number';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import Staking from 'sections/staking/context/StakingContext';
import { getStakingAmount } from '../helper';

interface MintInfoProps {
	unstakedCollateral: number;
	stakedCollateral: number;
	currentCRatio: number;
	transferableCollateral: number;
	debtBalance: number;
	lockedCollateral: number;
	targetCRatio: number;
	SNXRate: number;
	totalEscrowBalance: number;
}

const MintInfo: React.FC<MintInfoProps> = ({
	unstakedCollateral,
	stakedCollateral,
	transferableCollateral,
	currentCRatio,
	debtBalance,
	lockedCollateral,
	targetCRatio,
	SNXRate,
	totalEscrowBalance,
}) => {
	const { t } = useTranslation();
	const { amountToMint } = Staking.useContainer();
	const stakingAmount = getStakingAmount(targetCRatio, amountToMint, SNXRate);
	const changeInCollateral = stakedCollateral + stakingAmount;
	const additionalDebt = changeInCollateral * targetCRatio * SNXRate;
	const totalNewDebt = debtBalance + additionalDebt;

	const Rows = useMemo(
		() => [
			{
				title: t('staking.info.mint.table.not-staked'),
				value: unstakedCollateral,
				changedValue: amountToMint ? unstakedCollateral - stakingAmount : 0,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.staked'),
				value: amountToMint ? stakedCollateral : 0,
				changedValue: amountToMint ? changeInCollateral : 0,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.transferable'),
				value: transferableCollateral,
				changedValue: transferableCollateral - (stakingAmount - totalEscrowBalance),
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.locked'),
				value: lockedCollateral,
				changedValue: lockedCollateral + stakingAmount,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.c-ratio'),
				value: currentCRatio ? 100 / currentCRatio : 0,
				changedValue: ((changeInCollateral * SNXRate) / additionalDebt) * 100,
				currencyKey: '%',
			},
			{
				title: t('staking.info.mint.table.debt'),
				value: debtBalance,
				changedValue: totalNewDebt,
				currencyKey: SYNTHS_MAP.sUSD,
			},
		],
		[
			unstakedCollateral,
			stakedCollateral,
			transferableCollateral,
			currentCRatio,
			stakingAmount,
			lockedCollateral,
			totalNewDebt,
			debtBalance,
			changeInCollateral,
			SNXRate,
			additionalDebt,
			totalEscrowBalance,
			t,
		]
	);
	return (
		<>
			<Title>{t('staking.info.mint.title')}</Title>
			<Subtitle>
				<Trans i18nKey="staking.info.mint.subtitle" components={[<StyledLink />]} />
			</Subtitle>
			<DataContainer>
				{Rows.map(({ title, value, changedValue, currencyKey = '' }, i) => (
					<DataRow key={i}>
						<RowTitle>{title}</RowTitle>
						<ValueContainer>
							<RowValue>
								{formatCurrency(currencyKey, value, { currencyKey: currencyKey, decimals: 2 })}
							</RowValue>
							{stakingAmount > 0 && changedValue >= 0 && (
								<>
									<Svg src={Arrows} />{' '}
									<RowValue>
										{formatCurrency(currencyKey, changedValue, {
											currencyKey: currencyKey,
											decimals: 2,
										})}
									</RowValue>
								</>
							)}
						</ValueContainer>
					</DataRow>
				))}
			</DataContainer>
		</>
	);
};

export default MintInfo;
