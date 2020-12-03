import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
	Title,
	Subtitle,
	StyledLink,
	DataContainer,
	DataRow,
	RowTitle,
	RowValue,
	ValueContainer,
} from '../common';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { formatCurrency, formatPercent, toBigNumber } from 'utils/formatters/number';
import { Svg } from 'react-optimized-image';
import Arrows from 'assets/svg/app/arrows.svg';
import Staking from 'sections/staking/context/StakingContext';
import { getStakingAmount } from '../helper';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';

type StakingInfoProps = {
	isMint: boolean;
};

const StakingInfo: React.FC<StakingInfoProps> = ({ isMint }) => {
	const { t } = useTranslation();

	const {
		unstakedCollateral,
		percentageCurrentCRatio,
		debtBalance,
		targetCRatio,
		transferableCollateral,
		stakedCollateral,
		lockedCollateral,
		SNXRate,
		totalEscrowBalance,
	} = useStakingCalculations();

	const { amountToBurn, amountToMint } = Staking.useContainer();

	const unlockedStakeAmount = getStakingAmount(targetCRatio, amountToBurn, SNXRate);
	const stakingAmount = getStakingAmount(targetCRatio, amountToMint, SNXRate);

	const mintAdditionalDebt = stakedCollateral
		.plus(stakingAmount)
		.multipliedBy(targetCRatio)
		.multipliedBy(SNXRate);

	// Merged values
	const changedNotStakedValue = isMint
		? unstakedCollateral.minus(stakingAmount)
		: unstakedCollateral.plus(unlockedStakeAmount);
	const changedStakedValue = isMint
		? stakedCollateral.plus(stakingAmount)
		: stakedCollateral.minus(unlockedStakeAmount);
	const changedTransferable = isMint
		? transferableCollateral.minus(stakingAmount.minus(totalEscrowBalance))
		: transferableCollateral.plus(unlockedStakeAmount);
	const changedLocked = isMint
		? lockedCollateral.plus(stakingAmount)
		: lockedCollateral.minus(unlockedStakeAmount);
	const changeCRatio = isMint
		? changedNotStakedValue.multipliedBy(SNXRate).dividedBy(mintAdditionalDebt).multipliedBy(100)
		: toBigNumber(
				Math.abs(
					changedNotStakedValue
						.multipliedBy(SNXRate)
						.dividedBy(amountToBurn)
						.multipliedBy(100)
						.toNumber()
				)
		  );
	const changedDebt = isMint
		? debtBalance.plus(mintAdditionalDebt)
		: debtBalance.minus(amountToBurn);

	const Rows = useMemo(
		() => [
			{
				title: t('staking.info.table.not-staked'),
				value: unstakedCollateral,
				changedValue: changedNotStakedValue,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.table.staked'),
				value: stakedCollateral,
				changedValue: changedStakedValue,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.table.transferable'),
				value: transferableCollateral,
				changedValue: changedTransferable,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.table.locked'),
				value: lockedCollateral,
				changedValue: changedLocked,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.table.c-ratio'),
				value: formatPercent(percentageCurrentCRatio),
				changedValue: changeCRatio,
				currencyKey: '%',
			},
			{
				title: t('staking.info.table.debt'),
				value: debtBalance,
				changedValue: changedDebt,
				currencyKey: SYNTHS_MAP.sUSD,
			},
		],
		[amountToBurn, amountToMint, t]
	);

	return (
		<>
			<Title>{isMint ? t('staking.info.mint.title') : t('staking.info.burn.title')}</Title>
			<Subtitle>
				<Trans
					i18nKey={isMint ? 'staking.info.mint.subtitle' : 'staking.info.burn.subtitle'}
					components={[<StyledLink />]}
				/>
			</Subtitle>
			<DataContainer>
				{Rows.map(({ title, value, changedValue, currencyKey = '' }, i) => (
					<DataRow key={i}>
						<RowTitle>{title}</RowTitle>
						<ValueContainer>
							<RowValue>
								{formatCurrency(currencyKey, value, { currencyKey: currencyKey, decimals: 2 })}
							</RowValue>
							<>
								<Svg src={Arrows} />{' '}
								<RowValue>
									{formatCurrency(currencyKey, changedValue, {
										currencyKey: currencyKey,
										decimals: 2,
									})}
								</RowValue>
							</>
						</ValueContainer>
					</DataRow>
				))}
			</DataContainer>
		</>
	);
};
export default StakingInfo;
