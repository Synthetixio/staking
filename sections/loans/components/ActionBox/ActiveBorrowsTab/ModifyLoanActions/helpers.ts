import { wei } from '@synthetixio/wei';
import { SAFE_MIN_CRATIO_BUFFER } from 'sections/loans/constants';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { Synths } from 'constants/currency';
import { Rates } from '@synthetixio/queries';
import { Loan } from 'containers/Loans/types';

export const getSafeCratio = (loan: Loan) => wei(loan.minCratio).add(SAFE_MIN_CRATIO_BUFFER);

export const calculateMaxDraw = (loan: Loan, exchangeRates: Rates | null) => {
	const collateralUSDPrice = getExchangeRatesForCurrencies(
		exchangeRates,
		loan.collateralAsset === 'renBTC' ? Synths.sBTC : Synths.sETH,
		Synths.sUSD
	);
	const safeCratio = getSafeCratio(loan);
	const maxUSDBasedOnLoan = wei(loan.collateral).mul(collateralUSDPrice).div(safeCratio);
	const currentDebtUSDPrice = getExchangeRatesForCurrencies(
		exchangeRates,
		loan.currency,
		Synths.sUSD
	);
	const usdValueOfCurrentDebt = currentDebtUSDPrice.mul(loan.amount);

	const maxDraw = maxUSDBasedOnLoan.sub(usdValueOfCurrentDebt);
	return maxDraw.lte(0) ? wei(0) : maxDraw;
};
