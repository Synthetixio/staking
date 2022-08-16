import { wei } from '@synthetixio/wei';
import getSynthetixRewardTile from './getSynthetixRewardTile';

describe('getSynthetixRewardTile', () => {
  test('No staking rewards and have liq rewards', () => {
    const t = jest.fn();
    const stakingAndTradingRewards = wei(0);
    const liquidationRewards = wei(100);
    const result = getSynthetixRewardTile(t, stakingAndTradingRewards, liquidationRewards);
    expect(result.link).toBe('/earn/liquidation');
    expect(result.isDisabled).toBe(false);
  });
  test('Staking rewards and liq rewards', () => {
    const t = jest.fn();
    const stakingAndTradingRewards = wei(100);
    const liquidationRewards = wei(100);
    const result = getSynthetixRewardTile(t, stakingAndTradingRewards, liquidationRewards);
    expect(result.link).toBe('/earn/claim');
    expect(result.isDisabled).toBe(false);
  });
  test('No staking rewards and no liq rewards', () => {
    const t = jest.fn();
    const stakingAndTradingRewards = wei(0);
    const liquidationRewards = wei(0);
    const result = getSynthetixRewardTile(t, stakingAndTradingRewards, liquidationRewards);
    expect(result.link).toBe('/earn/claim');
    expect(result.isDisabled).toBe(true);
  });
  test('Have staking rewards, no liq rewards and delegate missing permission', () => {
    const t = jest.fn();
    const stakingAndTradingRewards = wei(100);
    const liquidationRewards = wei(0);
    const walletMissingPermissionToClaim = true;
    const result = getSynthetixRewardTile(
      t,
      stakingAndTradingRewards,
      liquidationRewards,
      walletMissingPermissionToClaim
    );
    expect(result.link).toBe('/earn/claim');
    expect(result.isDisabled).toBe(true);
  });
  test('No Staking rewards, have liq rewards and delegate missing permission', () => {
    const t = jest.fn();
    const stakingAndTradingRewards = wei(0);
    const liquidationRewards = wei(100);
    const walletMissingPermissionToClaim = true;
    const result = getSynthetixRewardTile(
      t,
      stakingAndTradingRewards,
      liquidationRewards,
      walletMissingPermissionToClaim
    );
    expect(result.link).toBe('/earn/liquidation');
    expect(result.isDisabled).toBe(false);
  });
  test('Have staking rewards, have liq rewards and delegate missing permission', () => {
    const t = jest.fn();
    const stakingAndTradingRewards = wei(100);
    const liquidationRewards = wei(100);
    const walletMissingPermissionToClaim = true;
    const result = getSynthetixRewardTile(
      t,
      stakingAndTradingRewards,
      liquidationRewards,
      walletMissingPermissionToClaim
    );
    expect(result.link).toBe('/earn/liquidation');
    expect(result.isDisabled).toBe(false);
  });
});
