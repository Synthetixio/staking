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
import { getStakingAmount } from '../helper';

interface BurnInfoProps {
	unstakedCollateral: number;
	stakedCollateral: number;
	currentCRatio: number;
	transferableCollateral: number;
	debtBalance: number;
	lockedCollateral: number;
	amountToBurn: string | null;
	targetCRatio: number;
	totalEscrowBalance: number;
	SNXRate: number;
}

const BurnInfo: React.FC<BurnInfoProps> = ({
	unstakedCollateral,
	stakedCollateral,
	transferableCollateral,
	currentCRatio,
	debtBalance,
	lockedCollateral,
	amountToBurn,
	targetCRatio,
	totalEscrowBalance,
	SNXRate,
}) => {
	const { t } = useTranslation();

	const amountToBurnNum = Number(amountToBurn);
	const unlockedStakeAmount = getStakingAmount(targetCRatio, amountToBurnNum.toString(), SNXRate);
	const changeInCollateral = stakedCollateral - unlockedStakeAmount;
	const additionalDebt = amountToBurnNum;
	const totalNewDebt = debtBalance - amountToBurnNum;

	const Rows = useMemo(
		() => [
			{
				title: t('staking.info.mint.table.not-staked'),
				value: unstakedCollateral,
				changedValue: unstakedCollateral + unlockedStakeAmount,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.staked'),
				value: stakedCollateral,
				changedValue: Math.abs(changeInCollateral),
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.transferable'),
				value: transferableCollateral,
				changedValue: transferableCollateral + unlockedStakeAmount,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.locked'),
				value: lockedCollateral,
				changedValue: lockedCollateral - unlockedStakeAmount,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.c-ratio'),
				value: 100 / currentCRatio,
				changedValue: Math.abs(((changeInCollateral * SNXRate) / additionalDebt) * 100),
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
			amountToBurn,
			lockedCollateral,
			totalNewDebt,
			targetCRatio,
			SNXRate,
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
			<Title>{t('staking.info.burn.title')}</Title>
			<Subtitle>
				<Trans i18nKey="staking.info.burn.subtitle" components={[<StyledLink />]} />
			</Subtitle>
			<DataContainer>
				{Rows.map(({ title, value, changedValue, currencyKey = '' }, i) => (
					<DataRow key={i}>
						<RowTitle>{title}</RowTitle>
						<ValueContainer>
							<RowValue>
								{formatCurrency(currencyKey, value, { currencyKey: currencyKey, decimals: 2 })}
							</RowValue>
							{amountToBurnNum > 0 && (
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

export default BurnInfo;
