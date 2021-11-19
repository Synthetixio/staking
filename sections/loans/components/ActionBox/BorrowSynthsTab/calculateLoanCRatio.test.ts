import { wei } from '@synthetixio/wei';
import { calculateLoanCRatio } from './calculateLoanCRatio';

describe('calculateLoanCRatio', () => {
	test('works with sETH as collateral', () => {
		const exchangeRates = {
			sETH: wei(4000),
			sUSD: wei(1),
		};
		const collateral = { amount: wei(2), asset: 'sETH' };
		const debt = { amount: wei(4000), asset: 'sUSD' };
		const result = calculateLoanCRatio(exchangeRates, collateral, debt);
		expect(result.toString(0)).toBe('2');
	});
	test('works with renBTC as collateral', () => {
		const exchangeRates = {
			sBTC: wei(60000),
			sUSD: wei(1),
		};
		const collateral = { amount: wei(1), asset: 'renBTC' };
		const debt = { amount: wei(6000), asset: 'sUSD' };
		const result = calculateLoanCRatio(exchangeRates, collateral, debt);
		expect(result.toString(0)).toBe('10');
	});
	test('return 0 when not enough data', () => {
		const exchangeRates = {
			sBTC: wei(60000),
			sUSD: wei(1),
		};
		const collateral = { amount: wei(1), asset: 'renBTC' };
		const debt = { amount: wei(6000), asset: 'sUSD' };
		expect(calculateLoanCRatio(null, collateral, debt).toString(0)).toBe('0');
		expect(
			calculateLoanCRatio(exchangeRates, { amount: wei(0), asset: 'renBTC' }, debt).toString(0)
		).toBe('0');
		expect(
			calculateLoanCRatio(exchangeRates, collateral, { amount: wei(0), asset: 'sUSD' }).toString(0)
		).toBe('0');
	});
});
