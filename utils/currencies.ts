import { CurrencyKey, Synths, CryptoCurrency, FIAT_SYNTHS } from 'constants/currency';
import { Rates } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';

export const isSynth = (currencyKey?: CurrencyKey) => (currencyKey || '') in Synths;
export const isCryptoCurrency = (currencyKey: CurrencyKey) => currencyKey in CryptoCurrency;
// @ts-ignore
export const isFiatCurrency = (currencyKey: CurrencyKey) => FIAT_SYNTHS.has(currencyKey);

// TODO: replace this with a more robust logic (like checking the asset field)
export const toInverseSynth = (currencyKey: CurrencyKey) => currencyKey.replace(/^s/i, 'i');
export const toStandardSynth = (currencyKey: CurrencyKey) => currencyKey.replace(/^i/i, 's');
export const synthToAsset = (currencyKey: CurrencyKey) => currencyKey.replace(/^(i|s)/i, '');
export const assetToSynth = (currencyKey: CurrencyKey) => `s${currencyKey}`;
export const iStandardSynth = (currencyKey: CurrencyKey) => currencyKey.startsWith('s');

export const synthToContractName = (currencyKey: CurrencyKey) => `Synth${currencyKey}`;

export const getExchangeRatesForCurrencies = (
  rates: Rates | null,
  base: CurrencyKey | null,
  quote: CurrencyKey | null
) => (rates == null || base == null || quote == null ? wei(0) : rates[base].div(rates[quote]));

export const getCurrencyKeyURLPath = (currencyKey: CurrencyKey) =>
  `https:///www.synthetix.io/assets/synths/svg/${currencyKey}.svg`;

export function calculatePercentChange(
  oldVal?: Wei | number | string,
  newVal?: Wei | number | string
) {
  if (!oldVal) return wei(0);
  if (!newVal) return wei(0);
  return wei(newVal)
    .sub(oldVal)
    .div(Wei.max(wei(oldVal), wei(0.01)));
}
