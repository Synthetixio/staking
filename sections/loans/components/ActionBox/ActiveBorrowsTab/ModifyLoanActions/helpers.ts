import { wei } from '@synthetixio/wei';
import { getSafeMinCRatioBuffer } from 'sections/loans/constants';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { Synths } from 'constants/currency';
import { Rates } from '@synthetixio/queries';
import { Loan } from 'containers/Loans/types';
import { getETHToken } from 'contracts/ethToken';
import { getRenBTCToken } from 'contracts/renBTCToken';

export const calculateMaxDraw = (loan: Loan, exchangeRates: Rates | null) => {
	const loanTypeIsETH = loan.collateralAsset === 'sETH';
	const collateralUSDPrice = getExchangeRatesForCurrencies(
		exchangeRates,
		loanTypeIsETH ? Synths.sETH : Synths.sBTC,
		Synths.sUSD
	);
	const collateralDecimals = loanTypeIsETH ? getETHToken().decimals : getRenBTCToken().decimals;
	const cRatioBuffer = getSafeMinCRatioBuffer(loan.currency, loan.collateralAsset);
	const safeCRatio = wei(loan.minCratio).add(cRatioBuffer);
	const maxUSDBasedOnLoan = wei(wei(loan.collateral), collateralDecimals)
		.mul(collateralUSDPrice)
		.div(safeCRatio);
	const currentDebtUSDPrice = getExchangeRatesForCurrencies(
		exchangeRates,
		loan.currency,
		Synths.sUSD
	);
	const usdValueOfCurrentDebt = currentDebtUSDPrice.mul(loan.amount);

	const maxDraw = maxUSDBasedOnLoan.sub(usdValueOfCurrentDebt);
	return maxDraw.lte(0) ? wei(0) : maxDraw;
};
