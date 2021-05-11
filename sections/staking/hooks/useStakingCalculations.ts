import { useMemo } from 'react';

import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useTokenSaleEscrowDateQuery from 'queries/escrow/useTokenSaleEscrowQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useEscrowDataQuery from 'queries/escrow/useEscrowDataQuery';
import { toBigNumber, maxBN, minBN, zeroBN, mulBN, divBN } from 'utils/formatters/number';

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

		const stakedCollateral = targetCRatio.isZero()
			? zeroBN
			: collateral.mul(minBN(toBigNumber(1), currentCRatio.div(targetCRatio)));

		const stakedCollateralValue = stakedCollateral.mul(SNXRate).div(toBigNumber(1e18));

		const lockedCollateral = collateral.sub(transferableCollateral);
		const unstakedCollateral = collateral.sub(stakedCollateral);
		const totalEscrowBalance = stakingEscrow.add(tokenSaleEscrow);

		const debtEscrowBalance = maxBN(
			debtBalance.add(totalEscrowBalance.mul(SNXRate).mul(targetCRatio)).sub(issuableSynths),
			zeroBN
		);

		const percentageCurrentCRatio = currentCRatio.isZero()
			? toBigNumber(0)
			: divBN(toBigNumber(1e18), currentCRatio);

		const percentageTargetCRatio = targetCRatio.isZero()
			? toBigNumber(0)
			: divBN(toBigNumber(1e18), targetCRatio);

		const percentCurrentCRatioOfTarget = percentageTargetCRatio.isZero()
			? zeroBN
			: divBN(percentageCurrentCRatio, percentageTargetCRatio);

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
