import { useMemo } from 'react';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import useEscrowBalanceQuery from 'queries/escrow/useEscrowBalance';

type StakingCalculations = {
	collateral: number;
	targetCRatio: number;
	currentCRatio: number;
	transferableCollateral: number;
	debtBalance: number;
	stakedCollateral: number;
	stakedCollateralValue: number;
	lockedCollateral: number;
	unstakedCollateral: number;
	SNXRate: number;
	totalEscrowBalance: number;
};
const useStakingCalculations = (): StakingCalculations => {
	const currencyRatesQuery = useCurrencyRatesQuery([CRYPTO_CURRENCY_MAP.SNX]);
	const debtDataQuery = useGetDebtDataQuery();
	const escrowBalanceQuery = useEscrowBalanceQuery();

	const debtData = debtDataQuery?.data ?? null;
	const currencyRates = currencyRatesQuery.data ?? null;
	const escrowBalance = escrowBalanceQuery.data ?? null;

	const results = useMemo(() => {
		const SNXRate = currencyRates?.SNX ?? 0;
		const collateral = debtData?.collateral ?? 0;
		const targetCRatio = debtData?.targetCRatio ?? 0;
		const currentCRatio = debtData?.currentCRatio ?? 0;
		const transferableCollateral = debtData?.transferable ?? 0;
		const debtBalance = debtData?.debtBalance ?? 0;
		const stakedCollateral = collateral * Math.min(1, currentCRatio / targetCRatio);
		const stakedCollateralValue = stakedCollateral ? stakedCollateral * SNXRate : 0;
		const lockedCollateral = collateral - transferableCollateral;
		const unstakedCollateral = collateral - stakedCollateral;
		const stakingEscrow = escrowBalance?.stakingEscrow ?? 0;
		const tokenSaleEscrow = escrowBalance?.tokenSaleEscrow ?? 0;
		const totalEscrowBalance = stakingEscrow + tokenSaleEscrow;
		return {
			collateral,
			targetCRatio,
			currentCRatio,
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
