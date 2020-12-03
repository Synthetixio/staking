import { useMemo } from 'react';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import useEscrowDataQuery from 'queries/escrow/useEscrowDataQuery';
import { BigNumber } from 'bignumber.js';
import { toBigNumber } from 'utils/formatters/number';

type StakingCalculations = {
	collateral: BigNumber;
	targetCRatio: BigNumber;
	percentageTargetCRatio: BigNumber;
	currentCRatio: BigNumber;
	transferableCollateral: BigNumber;
	debtBalance: BigNumber;
	stakedCollateral: BigNumber;
	stakedCollateralValue: BigNumber;
	lockedCollateral: BigNumber;
	unstakedCollateral: BigNumber;
	SNXRate: BigNumber;
	totalEscrowBalance: BigNumber;
	percentageCurrentCRatio: BigNumber;
};
const useStakingCalculations = (): StakingCalculations => {
	const currencyRatesQuery = useCurrencyRatesQuery([CRYPTO_CURRENCY_MAP.SNX]);
	const debtDataQuery = useGetDebtDataQuery();
	const escrowBalanceQuery = useEscrowDataQuery();

	const debtData = debtDataQuery?.data ?? null;
	const currencyRates = currencyRatesQuery.data ?? null;
	const escrowBalance = escrowBalanceQuery.data ?? null;

	const results = useMemo(() => {
		const SNXRate = toBigNumber(currencyRates?.SNX ?? 0);
		const collateral = toBigNumber(debtData?.collateral ?? 0);
		const targetCRatio = toBigNumber(debtData?.targetCRatio ?? 0);
		const currentCRatio = toBigNumber(debtData?.currentCRatio ?? 0);
		const transferableCollateral = toBigNumber(debtData?.transferable ?? 0);
		const debtBalance = toBigNumber(debtData?.debtBalance ?? 0);
		const stakingEscrow = toBigNumber(escrowBalance?.totalEscrowed ?? 0);
		const tokenSaleEscrow = toBigNumber(escrowBalance?.tokenSaleEscrow ?? 0);

		const stakedCollateral = collateral.multipliedBy(
			Math.min(1, currentCRatio.dividedBy(targetCRatio).toNumber())
		);
		const stakedCollateralValue = stakedCollateral.multipliedBy(SNXRate);
		const lockedCollateral = collateral.minus(transferableCollateral);
		const unstakedCollateral = collateral.minus(stakedCollateral);
		const totalEscrowBalance = stakingEscrow.plus(tokenSaleEscrow);
		const percentageCurrentCRatio = currentCRatio.isZero()
			? toBigNumber(0)
			: toBigNumber(1).div(currentCRatio);
		const percentageTargetCRatio = targetCRatio.isZero()
			? toBigNumber(0)
			: toBigNumber(1).div(targetCRatio);

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
		};
	}, [debtData, currencyRates, escrowBalance]);

	return {
		...results,
	};
};

export default useStakingCalculations;
