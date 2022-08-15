import { wei } from '@synthetixio/wei';
import { getButtonDisplaying, getSelfLiquidationChanges } from './selfLiquidationInfoCalculations';

describe('selfLiquidationCalculations', () => {
  describe('getButtonDisplaying', () => {
    test('burn max button', () => {
      const result = getButtonDisplaying({
        percentageCurrentCRatio: wei(2),
        percentageTargetCRatio: wei(3),
        sUSDBalance: wei(100),
        debtBalance: wei(150),
        canBurn: true,
      });
      expect(result).toBe('BURN_MAX_BUTTON');
    });
    test('burn max button not displaying since can burn is undefined', () => {
      const result = getButtonDisplaying({
        percentageCurrentCRatio: wei(2),
        percentageTargetCRatio: wei(3),
        sUSDBalance: wei(100),
        debtBalance: wei(150),
        canBurn: undefined,
      });
      expect(result).toBe(undefined);
    });
    test('burn max button not displaying since can burn is false', () => {
      const result = getButtonDisplaying({
        percentageCurrentCRatio: wei(2),
        percentageTargetCRatio: wei(3),
        sUSDBalance: wei(100),
        debtBalance: wei(150),
        canBurn: false,
      });
      expect(result).toBe(undefined);
    });
    test('self liquidation button', () => {
      const result = getButtonDisplaying({
        percentageCurrentCRatio: wei(2),
        percentageTargetCRatio: wei(3),
        sUSDBalance: wei(0),
        debtBalance: wei(150),
      });
      expect(result).toBe('SELF_LIQUIDATION_BUTTON');
    });
    test('not displaying due to C-Ratio ok', () => {
      const result = getButtonDisplaying({
        percentageCurrentCRatio: wei(3.1),
        percentageTargetCRatio: wei(3),
        sUSDBalance: wei(0),
        debtBalance: wei(150),
      });
      expect(result).toBe(undefined);
    });
    test('not displaying due to not staking', () => {
      const result = getButtonDisplaying({
        percentageCurrentCRatio: wei(0),
        percentageTargetCRatio: wei(3),
        sUSDBalance: wei(0),
        debtBalance: wei(150),
      });
      expect(result).toBe(undefined);
    });
    test('not displaying due to not sUSD balance bigger than debt balance', () => {
      const result = getButtonDisplaying({
        percentageCurrentCRatio: wei(2.9),
        percentageTargetCRatio: wei(3),
        sUSDBalance: wei(151),
        debtBalance: wei(150),
      });
      expect(result).toBe(undefined);
    });
  });

  describe('getSelfLiquidationChanges', () => {
    test('BURN_MAX_BUTTON displaying', () => {
      const result = getSelfLiquidationChanges({
        collateral: wei(50),
        stakedCollateral: wei(50),
        debtBalance: wei(100),
        SNXRate: wei(3),
        nonEscrowedBalance: wei(50),
        sUSDBalance: wei(50),
        selfLiquidationPenalty: wei(0.2),
        usdToBeLiquidatedWithPenalty: wei(10),
        buttonDisplaying: 'BURN_MAX_BUTTON',
      });
      expect(result.changedCollateral.toString(2)).toBe('50.00'); // no change
      expect(result.changedDebt.toString(2)).toBe('50.00'); // debtBalance - sUSDBalance = 100 -50
      expect(result.changedCRatio.toString(2)).toBe('3.00'); // collateral / (debtBalance / snxPrice) = 150/ 50
    });
    test('SELF_LIQUIDATION_BUTTON displaying, low non escrowed balance', () => {
      const result = getSelfLiquidationChanges({
        collateral: wei(50),
        stakedCollateral: wei(50),
        debtBalance: wei(100),
        SNXRate: wei(3),
        nonEscrowedBalance: wei(1),
        sUSDBalance: wei(0),
        selfLiquidationPenalty: wei(0.2),
        usdToBeLiquidatedWithPenalty: wei(10),
        buttonDisplaying: 'SELF_LIQUIDATION_BUTTON',
      });
      expect(result.changedCollateral.toString(2)).toBe('49.00'); // collateral - nonEscrowedBalance
      /**
       * debtToBeRemovedToGetBackToTarget = (usdToBeLiquidatedWithPenalty)/ (1 + selfLiquidationPenalty) = 10 / 1.2 = 8.33
       * debtToBeRemoved = debtToBeRemovedToGetBackToTarget * nonEscrowedBalance / (usdToBeLiquidatedWithPenalty/ SNXRate) = 8.33 * 1 / (10 / 3)  = 2.499
       * debtBalance - debtToBeRemoved = 100 - 2.499 =97.50
       */
      expect(result.changedDebt.toString(2)).toBe('97.50');
      expect(result.changedCRatio.toString(2)).toBe('1.51'); // changedCollateral / (changedDebt/3 ) = 49 / ( 97.5 / 3 )  = 1.50769231
    });
    test('SELF_LIQUIDATION_BUTTON displaying, high non escrowed balance', () => {
      const result = getSelfLiquidationChanges({
        collateral: wei(50),
        stakedCollateral: wei(50),
        debtBalance: wei(100),
        SNXRate: wei(3),
        nonEscrowedBalance: wei(50),
        sUSDBalance: wei(0),
        selfLiquidationPenalty: wei(0.2),
        usdToBeLiquidatedWithPenalty: wei(10),
        buttonDisplaying: 'SELF_LIQUIDATION_BUTTON',
      });
      expect(result.changedCollateral.toString(2)).toBe('46.67'); // collateral - (usdToBeLiquidatedWithPenalty/ snxRate ) = 50 - (10/3) = 46.67
      /**
       * debtToBeRemovedToGetBackToTarget = (usdToBeLiquidatedWithPenalty)/ (1 + selfLiquidationPenalty) = 10 / 1.2 = 8.33
       * debtBalance - debtToBeRemovedToGetBackToTarget = 100 - 8.33 = 91.67
       */
      expect(result.changedDebt.toString(2)).toBe('91.67');
      /**
       * Note: with real data we would expect this to get us back to the target c-ratio. The reason it's look low here is due to the arbitrary usdToBeLiquidatedWithPenalty passed in
       * changedCollateral / (changedDebt/3 ) = 46.67 / ( 91.67 / 3 )  = 1.53
       */
      expect(result.changedCRatio.toString(2)).toBe('1.53');
    });
  });
});
