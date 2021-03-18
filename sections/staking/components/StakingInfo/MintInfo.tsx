import React, { useMemo, FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useRecoilValue } from 'recoil';

import { amountToMintState, StakingPanelType } from 'store/staking';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';

import { toBigNumber, zeroBN } from 'utils/formatters/number';

import { CryptoCurrency, Synths } from 'constants/currency';

import { getStakingAmount, getTransferableAmountFromMint, sanitiseValue } from '../helper';
import InfoLayout from './InfoLayout';

const StakingInfo: FC = () => {
	const { t } = useTranslation();
	const {
		unstakedCollateral,
		debtBalance,
		targetCRatio,
		currentCRatio,
		transferableCollateral,
		stakedCollateral,
		SNXRate,
		collateral,
		balance,
	} = useStakingCalculations();
	const synthsBalancesQuery = useSynthsBalancesQuery();

	const amountToMint = useRecoilValue(amountToMintState);

	const sUSDBalance =
		synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? toBigNumber(0);

	const Rows = useMemo(() => {
		const amountToMintBN = toBigNumber(amountToMint);

		const stakingAmount = getStakingAmount(targetCRatio, amountToMintBN, SNXRate);

		const mintAdditionalDebt = stakedCollateral
			.plus(stakingAmount)
			.multipliedBy(targetCRatio)
			.multipliedBy(SNXRate);

		const changedStakedValue = stakedCollateral.plus(stakingAmount);

		const changedTransferable = transferableCollateral.isZero()
			? zeroBN
			: getTransferableAmountFromMint(balance, changedStakedValue);

		const changedDebt = mintAdditionalDebt;

		const changedSUSDBalance = sUSDBalance.plus(amountToMintBN);

		const changeCRatio = currentCRatio.isLessThan(targetCRatio)
			? unstakedCollateral
					.plus(stakedCollateral)
					.multipliedBy(SNXRate)
					.dividedBy(mintAdditionalDebt)
					.multipliedBy(100)
			: changedStakedValue.multipliedBy(SNXRate).dividedBy(mintAdditionalDebt).multipliedBy(100);

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
		amountToMint,
		t,
		SNXRate,
		currentCRatio,
		debtBalance,
		stakedCollateral,
		targetCRatio,
		transferableCollateral,
		unstakedCollateral,
		balance,
		collateral,
		sUSDBalance,
	]);

	const isInputEmpty = amountToMint.length === 0;

	return (
		<InfoLayout
			stakingInfo={Rows}
			isInputEmpty={isInputEmpty}
			collateral={collateral}
			infoType={StakingPanelType.MINT}
		/>
	);
};

export default StakingInfo;
