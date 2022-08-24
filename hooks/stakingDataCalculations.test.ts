import { wei } from '@synthetixio/wei';
import {
  calculateAPRNotStaking,
  calculateAPRStaked,
  calculateIsBelowCRatio,
  calculateWeeklyRewards,
} from './stakingDataCalculations';

describe('stakingDataCalculations', () => {
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

  test('calculateWeeklyRewards', () => {
    const sUSDRate = wei(1);
    const SNXRate = wei(3);
    const feePoolData = {
      feesToDistribute: wei(100),
      rewardsToDistribute: wei(100),
    } as any; // only passing data used by calculateWeeklyRewards
    const result = calculateWeeklyRewards(sUSDRate, SNXRate, feePoolData);
    expect(result.toString(0)).toBe('400');
  });
  test('calculateAPRStaked using real values', () => {
    const stakedValue = wei('394.573876656551863849');
    const debtBalance = wei('100.994046767896844506');
    const totalsUSDDebt = wei('67151234.050298826316792095');
    const previousWeekRewardsUsd = wei('2842119.089890058285027994');

    const result = calculateAPRStaked(
      stakedValue,
      debtBalance,
      totalsUSDDebt,
      previousWeekRewardsUsd
    );
    expect(result.toString(2)).toBe('0.56');
  });

  test('calculateAPRNotStaking using real values', () => {
    const SNXRate = wei('3.017000000000000000');
    const isL2 = true;
    const previousWeekRewardsUsd = wei('2841174.181008142203572415');
    const stakedSnxData = {
      systemStakingPercent: 0.7339104147412211,
      timestamp: 1660142652,
      stakedSnx: {
        ethereum: 134940195.19759858,
        optimism: 76582560.91378011,
      },
    };

    const result = calculateAPRNotStaking(SNXRate, isL2, previousWeekRewardsUsd, stakedSnxData);
    expect(result.toString(2)).toBe('0.64');
  });
});
