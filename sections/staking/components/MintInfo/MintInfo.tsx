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
	const { amountToStake } = Staking.useContainer();
	const amountToStakeNum = Number(amountToStake);
	const changeInCollateral = stakedCollateral + amountToStakeNum;
	const additionalDebt = changeInCollateral * targetCRatio * SNXRate;
	const totalNewDebt = debtBalance + additionalDebt;

	const Rows = useMemo(
		() => [
			{
				title: t('staking.info.mint.table.not-staked'),
				value: unstakedCollateral,
				changedValue: unstakedCollateral - amountToStakeNum,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.staked'),
				value: stakedCollateral,
				changedValue: changeInCollateral,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.transferable'),
				value: transferableCollateral,
				changedValue: transferableCollateral - (amountToStakeNum - totalEscrowBalance),
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.locked'),
				value: lockedCollateral,
				changedValue: lockedCollateral + amountToStakeNum,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.c-ratio'),
				value: 100 / currentCRatio,
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
			amountToStakeNum,
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
							{amountToStakeNum > 0 && changedValue >= 0 && (
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
