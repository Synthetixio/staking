import { wei } from '@synthetixio/wei';
import { SAFE_MIN_CRATIO_BUFFER } from 'sections/loans/constants';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { Synths } from 'constants/currency';
import { Rates } from '@synthetixio/queries';
import { Loan } from 'containers/Loans/types';
import { getETHToken } from 'contracts/ethToken';
import { getRenBTCToken } from 'contracts/renBTCToken';

export const getSafeCratio = (loan: Loan) => wei(loan.minCratio).add(SAFE_MIN_CRATIO_BUFFER);

export const calculateMaxDraw = (loan: Loan, exchangeRates: Rates | null) => {
	const loanTypeIsETH = loan.collateralAsset === 'sETH';
	const collateralUSDPrice = getExchangeRatesForCurrencies(
		exchangeRates,
		loanTypeIsETH ? Synths.sETH : Synths.sBTC,
		Synths.sUSD
	);
	const collateralDecimals = loanTypeIsETH ? getETHToken().decimals : getRenBTCToken().decimals;

	const safeCratio = getSafeCratio(loan);
	const maxUSDBasedOnLoan = wei(wei(loan.collateral), collateralDecimals)
		.mul(collateralUSDPrice)
		.div(safeCratio);
	const currentDebtUSDPrice = getExchangeRatesForCurrencies(
		exchangeRates,
		loan.currency,
		Synths.sUSD
	);
	const usdValueOfCurrentDebt = currentDebtUSDPrice.mul(loan.amount);

	const maxDraw = maxUSDBasedOnLoan.sub(usdValueOfCurrentDebt);
	return maxDraw.lte(0) ? wei(0) : maxDraw;
};
