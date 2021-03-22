import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useRecoilValue } from 'recoil';

import { amountToBurnState, StakingPanelType } from 'store/staking';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';

import { toBigNumber, zeroBN } from 'utils/formatters/number';

import { CryptoCurrency, Synths } from 'constants/currency';

import { getStakingAmount, getTransferableAmountFromBurn, sanitiseValue } from '../helper';

import InfoLayout from './InfoLayout';

const StakingInfo: FC = () => {
	const { t } = useTranslation();
	const {
		debtBalance,
		targetCRatio,
		currentCRatio,
		transferableCollateral,
		stakedCollateral,
		SNXRate,
		issuableSynths,
		debtEscrowBalance,
		collateral,
	} = useStakingCalculations();
	const synthsBalancesQuery = useSynthsBalancesQuery();

	const amountToBurn = useRecoilValue(amountToBurnState);

	const sUSDBalance =
		synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? toBigNumber(0);

	const Rows = useMemo(() => {
		const calculatedTargetBurn = Math.max(debtBalance.minus(issuableSynths).toNumber(), 0);

		const amountToBurnBN = toBigNumber(amountToBurn);

		let unlockedStakeAmount;

		if (
			currentCRatio.isGreaterThan(targetCRatio) &&
			amountToBurnBN.isLessThanOrEqualTo(calculatedTargetBurn)
		) {
			unlockedStakeAmount = zeroBN;
		} else {
			unlockedStakeAmount = getStakingAmount(targetCRatio, amountToBurnBN, SNXRate);
		}

		const changedStakedValue = stakedCollateral.isZero()
			? zeroBN
			: stakedCollateral.minus(unlockedStakeAmount);

		const changedTransferable = getTransferableAmountFromBurn(
			amountToBurn,
			debtEscrowBalance,
			targetCRatio,
			SNXRate,
			transferableCollateral
		);

		const changedDebt = debtBalance.isZero() ? zeroBN : debtBalance.minus(amountToBurnBN);

		const changedSUSDBalance = sUSDBalance.minus(amountToBurnBN);

		const changeCRatio = toBigNumber(100).dividedBy(
			changedDebt.dividedBy(SNXRate).dividedBy(collateral)
		);

		return {
			barRows: [
				{
					title: t('staking.info.table.staked'),
					value: sanitiseValue(stakedCollateral),
					changedValue: sanitiseValue(changedStakedValue),
					percentage: collateral.isZero()
						? toBigNumber(0)
						: sanitiseValue(stakedCollateral).dividedBy(collateral),
					changedPercentage: collateral.isZero()
						? toBigNumber(0)
						: sanitiseValue(changedStakedValue).dividedBy(collateral),
					currencyKey: CryptoCurrency.SNX,
				},
				{
					title: t('staking.info.table.transferable'),
					value: sanitiseValue(transferableCollateral),
					changedValue: sanitiseValue(changedTransferable),
					percentage: collateral.isZero()
						? toBigNumber(0)
						: sanitiseValue(transferableCollateral).dividedBy(sanitiseValue(collateral)),
					changedPercentage: collateral.isZero()
						? toBigNumber(0)
						: sanitiseValue(changedTransferable).dividedBy(sanitiseValue(collateral)),
					currencyKey: CryptoCurrency.SNX,
				},
			],
			dataRows: [
				{
					title: t('staking.info.table.c-ratio'),
					value: sanitiseValue(toBigNumber(100).dividedBy(currentCRatio)),
					changedValue: sanitiseValue(changeCRatio),
					currencyKey: '%',
				},
				{
					title: t('staking.info.table.susd-balance'),
					value: sanitiseValue(sUSDBalance),
					changedValue: sanitiseValue(changedSUSDBalance),
					currencyKey: Synths.sUSD,
				},
				{
					title: t('staking.info.table.debt'),
					value: sanitiseValue(debtBalance),
					changedValue: sanitiseValue(changedDebt),
					currencyKey: Synths.sUSD,
				},
			],
		};
	}, [
		amountToBurn,
		t,
		SNXRate,
		currentCRatio,
		debtBalance,
		stakedCollateral,
		targetCRatio,
		transferableCollateral,
		issuableSynths,
		collateral,
		debtEscrowBalance,
		sUSDBalance,
	]);

	const isInputEmpty = amountToBurn.length === 0;

	return (
		<InfoLayout
			stakingInfo={Rows}
			isInputEmpty={isInputEmpty}
			collateral={collateral}
			infoType={StakingPanelType.CLEAR}
		/>
	);
};

export default StakingInfo;
