import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';

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
};
const useStakingCalculations = (): StakingCalculations => {
	const currencyRatesQuery = useCurrencyRatesQuery([CRYPTO_CURRENCY_MAP.SNX]);
	const debtDataQuery = useGetDebtDataQuery();

	const debtData = debtDataQuery?.data ?? null;
	const currencyRates = currencyRatesQuery.data ?? null;

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
	};
};

export default useStakingCalculations;
