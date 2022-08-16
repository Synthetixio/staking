import { wei } from '@synthetixio/wei';
import { getSafeMinCRatioBuffer } from 'sections/loans/constants';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { Synths } from 'constants/currency';
import { Rates } from '@synthetixio/queries';
import { Loan } from 'containers/Loans/types';
import { getETHToken } from 'contracts/ethToken';

export const calculateMaxDraw = (loan: Loan, exchangeRates: Rates | null) => {
  const collateralUSDPrice = getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, Synths.sUSD);
  const collateralDecimals = getETHToken().decimals;
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
