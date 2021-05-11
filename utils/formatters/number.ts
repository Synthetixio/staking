import BN from 'bn.js';
import { ethers } from 'ethers';

import {
	DEFAULT_CRYPTO_DECIMALS,
	DEFAULT_FIAT_DECIMALS,
	DEFAULT_NUMBER_DECIMALS,
	DEFAULT_UNIT,
} from 'constants/defaults';
import { CurrencyKey } from 'constants/currency';
import { isFiatCurrency } from 'utils/currencies';

export type NumericValue = BN | string | number;

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
	BN.isBN(value) ? value : new BN(value.toString());

export const zeroBN = toBigNumber(0);
export const maxBN = BN.max;
export const minBN = BN.min;
export const weiBN = toBigNumber(1e18);

export const mulBN = (x: BN, y: BN): BN => x.mul(y).div(weiBN);
export const divBN = (x: BN, y: BN): BN => x.mul(weiBN).div(y);

export const formatNumber = (value: NumericValue, options?: FormatNumberOptions) => {
	const prefix = options?.prefix;
	const suffix = options?.suffix;

	const formattedValue = [];
	if (prefix) {
		formattedValue.push(prefix);
	}

	formattedValue.push(toBigNumber(value).toString());
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

export function formatUnits(value: any, units: number, decimals?: number): string {
	return formatNumber(toBigNumber(value.toString()).div(toBigNumber(10).pow(toBigNumber(units))), {
		decimals: decimals,
	});
}

export function toEthersBig(a: any, b: number): ethers.BigNumber {
	return ethers.utils.parseUnits(a.div(Math.pow(10, b)).toString(), b);
}

export const formatBNumber = (value: BN, options?: FormatNumberOptions) => {
	const prefix = options?.prefix;
	const suffix = options?.suffix;
	const decimals = options?.decimals;

	const formattedValue = [];
	if (prefix) {
		formattedValue.push(prefix);
	}

	const decimalValue = Number(ethers.utils.formatUnits(value.toString(), 18));

	formattedValue.push(ethers.utils.commify(decimalValue.toFixed(decimals)));
	if (suffix) {
		formattedValue.push(` ${suffix}`);
	}

	return formattedValue.join('');
};

export const formatBNCryptoCurrency = (value: BN, options?: FormatCurrencyOptions) =>
	formatBNumber(value, {
		prefix: options?.sign,
		suffix: options?.currencyKey,
		decimals: options?.decimals ?? DEFAULT_CRYPTO_DECIMALS,
	});

export const formatBNFiatCurrency = (value: BN, options?: FormatCurrencyOptions) =>
	formatBNumber(value, {
		prefix: options?.sign,
		suffix: options?.currencyKey,
		decimals: options?.decimals ?? DEFAULT_CURRENCY_DECIMALS,
	});

export const formatBNCurrency = ({
	value,
	currencyKey,
	decimals,
	sign,
}: {
	value: BN;
	currencyKey: CurrencyKey;
	decimals?: number;
	sign?: string;
}): string => {
	return isFiatCurrency(currencyKey)
		? formatBNFiatCurrency(value, { sign, currencyKey })
		: formatBNCryptoCurrency(value, { sign, currencyKey });
};

export const formatBNPercent = (value: BN, options?: { minDecimals: number }) => {
	const decimals = options?.minDecimals ?? 2;

	return `${(Number(ethers.utils.formatUnits(value.toString(), 18)) * 100).toFixed(decimals)}%`;
};
