import BigJS from 'big.js';
import toformat from 'toformat';

toformat(BigJS);

const PRECISION = 4;

export type Big = BigJS;

export function toFixed(a: any, b: any, precision?: number): string {
	if (isZero(toBig(a)) || isZero(toBig(b))) {
		return '0';
	}
	return toBig(a)
		.div(toBig(b))
		.toFormat(precision ?? PRECISION);
}

export function formatUnits(a: any, decimals: number, precision?: number): Big {
	return toFixed(a, toBig(10).pow(decimals), precision);
}

export function isZero(a: any): Big {
	return toBig(a).eq(toBig('0'));
}

export function toBig(n: any): Big {
	return new BigJS(n.toString());
}
