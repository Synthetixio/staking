import BigNumber from 'bignumber.js';

import {
	DEFAULT_CRYPTO_DECIMALS,
	DEFAULT_FIAT_DECIMALS,
	DEFAULT_NUMBER_DECIMALS,
} from 'constants/defaults';
import { CurrencyKey } from 'constants/currency';
import { isFiatCurrency } from 'utils/currencies';

export type NumericValue = BigNumber | string | number;

export type FormatNumberOptions = {
	decimals?: number;
	prefix?: string;
	suffix?: string;
};

export type FormatCurrencyOptions = {
	decimals?: number;
	sign?: string;
	currencyKey?: CurrencyKey;
};

const DEFAULT_CURRENCY_DECIMALS = 2;
export const SHORT_CRYPTO_CURRENCY_DECIMALS = 4;
export const LONG_CRYPTO_CURRENCY_DECIMALS = 8;

export const getDecimalPlaces = (value: NumericValue) =>
	(value.toString().split('.')[1] || '').length;

export const toBigNumber = (value: NumericValue) =>
	BigNumber.isBigNumber(value) ? value : new BigNumber(value);

export const zeroBN = toBigNumber(0);

export const maxBN = BigNumber.maximum;

export const minBN = BigNumber.minimum;

export const formatNumber = (value: NumericValue, options?: FormatNumberOptions) => {
	const prefix = options?.prefix;
	const suffix = options?.suffix;

	const formattedValue = [];
	if (prefix) {
		formattedValue.push(prefix);
	}

	formattedValue.push(toBigNumber(value).toFormat(options?.decimals ?? DEFAULT_NUMBER_DECIMALS));
	if (suffix) {
		formattedValue.push(` ${suffix}`);
	}

	return formattedValue.join('');
};

export const formatCryptoCurrency = (value: NumericValue, options?: FormatCurrencyOptions) =>
	formatNumber(value, {
		prefix: options?.sign,
		suffix: options?.currencyKey,
		decimals: options?.decimals ?? DEFAULT_CRYPTO_DECIMALS,
	});

export const formatFiatCurrency = (value: NumericValue, options?: FormatCurrencyOptions) =>
	formatNumber(value, {
		prefix: options?.sign,
		suffix: options?.currencyKey,
		decimals: options?.decimals ?? DEFAULT_FIAT_DECIMALS,
	});

export const formatCurrency = (
	currencyKey: CurrencyKey,
	value: NumericValue,
	options?: FormatCurrencyOptions
) =>
	isFiatCurrency(currencyKey)
		? formatFiatCurrency(value, options)
		: formatCryptoCurrency(value, options);

export const formatPercent = (value: NumericValue, options?: { minDecimals: number }) => {
	const decimals = options?.minDecimals ?? 2;

	return `${(Number(value) * 100).toFixed(decimals)}%`;
};

// TODO: figure out a robust way to get the correct precision.
const getPrecision = (amount: NumericValue) => {
	if (amount >= 1) {
		return DEFAULT_CURRENCY_DECIMALS;
	}
	if (amount > 0.01) {
		return SHORT_CRYPTO_CURRENCY_DECIMALS;
	}
	return LONG_CRYPTO_CURRENCY_DECIMALS;
};

// TODO: use a library for this, because the sign does not always appear on the left. (perhaps something like number.toLocaleString)
export const formatCurrencyWithSign = (
	sign: string | null | undefined,
	value: NumericValue,
	decimals?: number
) => `${sign}${formatCurrency(String(value), decimals || getPrecision(value))}`;

export const formatCurrencyWithKey = (
	currencyKey: CurrencyKey,
	value: NumericValue,
	decimals?: number
) => `${formatCurrency(String(value), decimals || getPrecision(value))} ${currencyKey}`;
