import Wei, { wei } from '@synthetixio/wei';

export const getButtonDisplaying = ({
  percentageTargetCRatio,
  percentageCurrentCRatio,
  sUSDBalance,
  debtBalance,
  canBurn,
}: {
  percentageTargetCRatio: Wei;
  percentageCurrentCRatio: Wei;
  sUSDBalance: Wei;
  debtBalance: Wei;
  canBurn?: Boolean;
}) => {
  const notStaking = percentageCurrentCRatio.eq(0);
  if (notStaking) return undefined;
  const cRatioOk = percentageCurrentCRatio.gt(percentageTargetCRatio);
  if (cRatioOk) return undefined;
  const selfLiquidateButtonDisplaying = sUSDBalance.eq(0);

  if (selfLiquidateButtonDisplaying) return 'SELF_LIQUIDATION_BUTTON';
  const burnMaxButtonIsDisplaying = sUSDBalance.gt(0) && sUSDBalance.lt(debtBalance) && canBurn;
  if (burnMaxButtonIsDisplaying) return 'BURN_MAX_BUTTON';
  return undefined;
};

export const getSelfLiquidationChanges = ({
  collateral,
  stakedCollateral,
  debtBalance,
  SNXRate,
  nonEscrowedBalance,
  sUSDBalance,
  selfLiquidationPenalty,
  usdToBeLiquidatedWithPenalty,
  buttonDisplaying,
}: {
  collateral: Wei;
  stakedCollateral: Wei;
  debtBalance: Wei;
  SNXRate: Wei;
  nonEscrowedBalance: Wei;
  sUSDBalance: Wei;
  selfLiquidationPenalty: Wei;
  usdToBeLiquidatedWithPenalty: Wei;
  buttonDisplaying: ReturnType<typeof getButtonDisplaying>;
}) => {
  const snxToBeLiquidatedToGetBackToTarget = usdToBeLiquidatedWithPenalty.gt(0)
    ? usdToBeLiquidatedWithPenalty.div(SNXRate)
    : wei(0);

  const getChangedDebt = () => {
    if (buttonDisplaying === 'BURN_MAX_BUTTON') {
      return debtBalance.sub(sUSDBalance);
    }
    if (buttonDisplaying === 'SELF_LIQUIDATION_BUTTON') {
      const debtToBeRemovedToGetBackToTarget = usdToBeLiquidatedWithPenalty.div(
        wei(1).add(selfLiquidationPenalty) // removing the penalty
      );

      const debtToBeRemoved = snxToBeLiquidatedToGetBackToTarget.gt(nonEscrowedBalance)
        ? debtToBeRemovedToGetBackToTarget
            .mul(nonEscrowedBalance)
            .div(snxToBeLiquidatedToGetBackToTarget)
        : debtToBeRemovedToGetBackToTarget;
      return debtBalance.sub(debtToBeRemoved);
    }
    return debtBalance;
  };
  const getChangedCollateral = () => {
    if (buttonDisplaying !== 'SELF_LIQUIDATION_BUTTON') return stakedCollateral;
    const snxToBeLiquidated = snxToBeLiquidatedToGetBackToTarget.gt(nonEscrowedBalance)
      ? nonEscrowedBalance
      : snxToBeLiquidatedToGetBackToTarget;
    return collateral.sub(snxToBeLiquidated);
  };
  const changedDebt = getChangedDebt();
  const changedCollateral = getChangedCollateral();
  const changedCRatio = changedDebt.eq(0)
    ? wei(0)
    : changedCollateral.div(changedDebt.div(SNXRate));

  return {
    changedDebt,
    changedCRatio,
    changedCollateral,
  };
};
