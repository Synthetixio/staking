import { wei } from '@synthetixio/wei';
import { calculateIsBelowCRatio } from './useUserStakingData';

describe('useUserStakingDate', () => {
	test('calculateIsBelowCRatio is below target', () => {
		const currentCRatio = 1 / 4; // 0.24 (400%)
		const targetCRatio = 1 / 5; // 0.2 (500%)
		const isBelowCRatio = calculateIsBelowCRatio(wei(currentCRatio), wei(targetCRatio));
		expect(isBelowCRatio).toBe(true);
	});
	test('calculateIsBelowCRatio is on target', () => {
		const currentCRatio = 1 / 5; // 0.24 (600%)
		const targetCRatio = 1 / 5; // 0.2 (500%)
		const isBelowCRatio = calculateIsBelowCRatio(wei(currentCRatio), wei(targetCRatio));
		expect(isBelowCRatio).toBe(true);
	});
	test('calculateIsBelowCRatio is above', () => {
		const currentCRatio = 1 / 6; // ~0.16 (625%)
		const targetCRatio = 1 / 5; // 0.2 (500%)
		const isBelowCRatio = calculateIsBelowCRatio(wei(currentCRatio), wei(targetCRatio));
		expect(isBelowCRatio).toBe(false);
	});
});
