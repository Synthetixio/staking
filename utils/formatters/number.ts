import { wei, WeiSource } from '@synthetixio/wei';
import {
	DEFAULT_CRYPTO_DECIMALS,
	DEFAULT_FIAT_DECIMALS,
	DEFAULT_NUMBER_DECIMALS,
} from 'constants/defaults';
import { isFiatCurrency } from 'utils/currencies';

export type FormatNumberOptions = {
	decimals?: number;
	prefix?: string;
	suffix?: string;
};

export type FormatCurrencyOptions = {
	decimals?: number;
	sign?: string;
	currencyKey?: string;
};

export const formatNumber = (value: WeiSource, options?: FormatNumberOptions) => {
	const prefix = options?.prefix;
	const suffix = options?.suffix;

	const formattedValue = [];
	if (prefix) {
		formattedValue.push(prefix);
	}

	formattedValue.push(wei(value).toString(options?.decimals ?? DEFAULT_NUMBER_DECIMALS));
	if (suffix) {
		formattedValue.push(` ${suffix}`);
	}

	return formattedValue.join('');
};

export const formatCryptoCurrency = (value: WeiSource, options?: FormatCurrencyOptions) =>
	formatNumber(value, {
		prefix: options?.sign,
		suffix: options?.currencyKey,
		decimals: options?.decimals ?? DEFAULT_CRYPTO_DECIMALS,
	});

export const formatFiatCurrency = (value: WeiSource, options?: FormatCurrencyOptions) =>
	formatNumber(value, {
		prefix: options?.sign,
		suffix: options?.currencyKey,
		decimals: options?.decimals ?? DEFAULT_FIAT_DECIMALS,
	});

export const formatCurrency = (
	currencyKey: string,
	value: WeiSource,
	options?: FormatCurrencyOptions
) =>
	isFiatCurrency(currencyKey)
		? formatFiatCurrency(value, options)
		: formatCryptoCurrency(value, options);

export const formatPercent = (value: WeiSource, options?: { minDecimals: number }) => {
	const decimals = options?.minDecimals ?? 2;

	return `${(Number(value) * 100).toFixed(decimals)}%`;
};
