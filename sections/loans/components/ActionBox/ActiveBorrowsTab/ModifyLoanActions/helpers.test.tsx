import { wei } from '@synthetixio/wei';
import { Synths } from 'constants/currency';
import { calculateMaxDraw, getSafeCratio } from './helpers';

describe('calculateMaxDraw', () => {
	test('works', () => {
		const loan = {
			collateralAsset: 'ETH',
			currency: 'sUSD',
			collateral: wei(1).toBN(),
			amount: wei(1500).toBN(),
			minCratio: wei(1.3).toBN(),
		} as any;
		const exchangeRates = {
			[Synths.sETH]: wei(3000),
			[Synths.sUSD]: wei(1),
		};
		const result = calculateMaxDraw(loan, exchangeRates);
		expect(result.toString(0)).toBe('500'); // 3000 / (1.3 + 0.2) - 1500
	});
	test('returns 0 if maxDraw is negative', () => {
		const loan = {
			collateralAsset: 'ETH',
			currency: 'sUSD',
			collateral: wei(1).toBN(),
			amount: wei(2100).toBN(),
			minCratio: wei(1.3).toBN(),
		} as any;
		const exchangeRates = {
			[Synths.sETH]: wei(3000),
			[Synths.sUSD]: wei(1),
		};
		const result = calculateMaxDraw(loan, exchangeRates);
		expect(result.toString(0)).toBe('0'); // 3000 / (1.3 + 0.2)
	});
});

describe('getSafeCratio', () => {
	test('works', () => {
		const loan = { minCratio: wei(1.3) } as any;
		const result = getSafeCratio(loan);
		expect(result.toString(1)).toBe('1.5');
	});
});
