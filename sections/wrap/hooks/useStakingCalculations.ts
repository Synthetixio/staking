import { useMemo } from 'react';

import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useTokenSaleEscrowDateQuery from 'queries/escrow/useTokenSaleEscrowQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useEscrowDataQuery from 'queries/escrow/useEscrowDataQuery';
import { toBigNumber, maxBN, zeroBN } from 'utils/formatters/number';

const useStakingCalculations = () => {
	const exchangeRatesQuery = useExchangeRatesQuery();
	const debtDataQuery = useGetDebtDataQuery();
	const rewardEscrowQuery = useEscrowDataQuery();
	const tokenSaleEscrowQuery = useTokenSaleEscrowDateQuery();

	const debtData = debtDataQuery?.data ?? null;
	const exchangeRates = exchangeRatesQuery.data ?? null;
	const rewardEscrowBalance = rewardEscrowQuery.data ?? null;
	const tokenSaleEscrowBalance = tokenSaleEscrowQuery.data ?? null;

	const results = useMemo(() => {
		const SNXRate = toBigNumber(exchangeRates?.SNX ?? 0);
		const collateral = toBigNumber(debtData?.collateral ?? 0);
		const targetCRatio = toBigNumber(debtData?.targetCRatio ?? 0);
		const currentCRatio = toBigNumber(debtData?.currentCRatio ?? 0);
		const transferableCollateral = toBigNumber(debtData?.transferable ?? 0);
		const debtBalance = toBigNumber(debtData?.debtBalance ?? 0);
		const stakingEscrow = toBigNumber(rewardEscrowBalance?.totalEscrowed ?? 0);
		const tokenSaleEscrow = toBigNumber(tokenSaleEscrowBalance?.totalEscrowed ?? 0);
		const issuableSynths = toBigNumber(debtData?.issuableSynths ?? 0);
		const balance = toBigNumber(debtData?.balance ?? 0);

		const stakedCollateral = collateral.multipliedBy(
			Math.min(1, currentCRatio.dividedBy(targetCRatio).toNumber())
		);
		const stakedCollateralValue = stakedCollateral.multipliedBy(SNXRate);
		const lockedCollateral = collateral.minus(transferableCollateral);
		const unstakedCollateral = collateral.minus(stakedCollateral);
		const totalEscrowBalance = stakingEscrow.plus(tokenSaleEscrow);

		const debtEscrowBalance = maxBN(
			debtBalance
				.plus(totalEscrowBalance.multipliedBy(SNXRate).multipliedBy(targetCRatio))
				.minus(issuableSynths),
			zeroBN
		);

		const percentageCurrentCRatio = currentCRatio.isZero()
			? toBigNumber(0)
			: toBigNumber(1).div(currentCRatio);
		const percentageTargetCRatio = targetCRatio.isZero()
			? toBigNumber(0)
			: toBigNumber(1).div(targetCRatio);
		const percentCurrentCRatioOfTarget = percentageCurrentCRatio.div(percentageTargetCRatio);

		return {
			collateral,
			targetCRatio,
			percentageTargetCRatio,
			currentCRatio,
			percentageCurrentCRatio,
			transferableCollateral,
			debtBalance,
			stakedCollateral,
			stakedCollateralValue,
			lockedCollateral,
			unstakedCollateral,
			SNXRate,
			totalEscrowBalance,
			issuableSynths,
			percentCurrentCRatioOfTarget,
			stakingEscrow,
			debtEscrowBalance,
			balance,
		};
	}, [debtData, exchangeRates, rewardEscrowBalance, tokenSaleEscrowBalance]);

	return results;
};

export default useStakingCalculations;
