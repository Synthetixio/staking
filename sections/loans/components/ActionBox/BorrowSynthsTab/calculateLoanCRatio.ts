import { Synths } from 'constants/currency';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { Rates } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';

export const calculateLoanCRatio = (
  exchangeRates: Rates | null,
  collateral: { amount: Wei; asset: string },
  debt: { amount: Wei; asset: string }
) => {
  if (!exchangeRates || collateral.amount.eq(0) || debt.amount.eq(0)) {
    return wei(0);
  }

  const collateralUSDPrice = getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, Synths.sUSD);

  const debtUSDPrice = getExchangeRatesForCurrencies(exchangeRates, debt.asset, Synths.sUSD);

  return collateral.amount.mul(collateralUSDPrice).div(debtUSDPrice.mul(debt.amount));
};
