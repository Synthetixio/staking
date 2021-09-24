import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useRecoilValue } from 'recoil';

import { amountToBurnState, StakingPanelType } from 'store/staking';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

import { CryptoCurrency, Synths } from 'constants/currency';

import { getStakingAmount, getTransferableAmountFromBurn, sanitiseValue } from '../helper';

import InfoLayout from './InfoLayout';
import useSynthetixQueries from '@synthetixio/queries';
import { walletAddressState } from 'store/wallet';
import { wei } from '@synthetixio/wei';
import { parseSafeWei } from 'utils/parse';

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

	const walletAddress = useRecoilValue(walletAddressState);
	const { useSynthsBalancesQuery } = useSynthetixQueries();

	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);

	const amountToBurn = useRecoilValue(amountToBurnState);

	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? wei(0);

	const Rows = useMemo(() => {
		const calculatedTargetBurn = Math.max(debtBalance.sub(issuableSynths).toNumber(), 0);

		const amountToBurnWei = parseSafeWei(amountToBurn, 0);

		let unlockedStakeAmount;

		if (currentCRatio.gt(targetCRatio) && amountToBurnWei.lte(calculatedTargetBurn)) {
			unlockedStakeAmount = wei(0);
		} else {
			unlockedStakeAmount = getStakingAmount(targetCRatio, amountToBurnWei, SNXRate);
		}

		const changedStakedValue = stakedCollateral.eq(0)
			? wei(0)
			: stakedCollateral.sub(unlockedStakeAmount);

		const changedTransferable = getTransferableAmountFromBurn(
			amountToBurn,
			debtEscrowBalance,
			targetCRatio,
			SNXRate,
			transferableCollateral
		);

		const changedDebt = debtBalance.eq(0) ? wei(0) : debtBalance.sub(amountToBurnWei);

		const changedSUSDBalance = sUSDBalance.sub(amountToBurnWei);

		const changeCRatio = currentCRatio.neg(); // wei(100).div(changedDebt.div(SNXRate).div(collateral));

		return {
			barRows: [
				{
					title: t('staking.info.table.staked'),
					value: sanitiseValue(stakedCollateral),
					changedValue: sanitiseValue(changedStakedValue),
					percentage: collateral.eq(0) ? wei(0) : sanitiseValue(stakedCollateral).div(collateral),
					changedPercentage: collateral.eq(0)
						? wei(0)
						: sanitiseValue(changedStakedValue).div(collateral),
					currencyKey: CryptoCurrency.SNX,
				},
				{
					title: t('staking.info.table.transferable'),
					value: sanitiseValue(transferableCollateral),
					changedValue: sanitiseValue(changedTransferable),
					percentage: collateral.eq(0)
						? wei(0)
						: sanitiseValue(transferableCollateral).div(sanitiseValue(collateral)),
					changedPercentage: collateral.eq(0)
						? wei(0)
						: sanitiseValue(changedTransferable).div(sanitiseValue(collateral)),
					currencyKey: CryptoCurrency.SNX,
				},
			],
			dataRows: [
				{
					title: t('staking.info.table.c-ratio'),
					value: currentCRatio.eq(0) ? wei(0) : sanitiseValue(wei(100).div(currentCRatio)),
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
