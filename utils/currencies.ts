import { CurrencyKey, Synths, CryptoCurrency, FIAT_SYNTHS } from 'constants/currency';
import { Rates } from 'queries/rates/useExchangeRatesQuery';
import { toBigNumber, zeroBN } from './formatters/number';

export const isSynth = (currencyKey: CurrencyKey) => currencyKey in Synths;
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
) =>
	rates == null || base == null || quote == null
		? zeroBN
		: rates[base].mul(toBigNumber(1).div(rates[quote]));

export const getCurrencyKeyURLPath = (currencyKey: CurrencyKey) =>
	`https:///www.synthetix.io/assets/synths/svg/${currencyKey}.svg`;
