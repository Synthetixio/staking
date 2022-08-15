import { wei } from '@synthetixio/wei';
import { calculateIsBelowCRatio } from '../utils/balances';

describe('useUserStakingDate', () => {
  test('calculateIsBelowCRatio is below target', () => {
    const currentCRatio = 1 / 4; // 0.24 (400%)
    const targetCRatio = 1 / 5; // 0.2 (500%)
    const threshold = wei(0.01);
    const isBelowCRatio = calculateIsBelowCRatio(wei(currentCRatio), wei(targetCRatio), threshold);
    expect(isBelowCRatio).toBe(true);
  });
  test('calculateIsBelowCRatio respects threshold', () => {
    const currentCRatio = 1 / 4.99; // 0.2004 (499+%)
    const targetCRatio = 1 / 5; // 0.2 (500%)

    const resultWithThreshold = calculateIsBelowCRatio(
      wei(currentCRatio),
      wei(targetCRatio),
      wei(0.01)
    );
    expect(resultWithThreshold).toBe(false);
    const resultWithoutThreshold = calculateIsBelowCRatio(
      wei(currentCRatio),
      wei(targetCRatio),
      wei(0)
    );
    expect(resultWithoutThreshold).toBe(true);
  });

  test('calculateIsBelowCRatio is above', () => {
    const currentCRatio = 1 / 6; // ~0.16 (625%)
    const targetCRatio = 1 / 5; // 0.2 (500%)
    const threshold = wei(0.01);
    const isBelowCRatio = calculateIsBelowCRatio(wei(currentCRatio), wei(targetCRatio), threshold);
    expect(isBelowCRatio).toBe(false);
  });
});
