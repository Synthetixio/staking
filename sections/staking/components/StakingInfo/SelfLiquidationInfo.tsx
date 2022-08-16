import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { CryptoCurrency, Synths } from 'constants/currency';
import Connector from 'containers/Connector';
import useGetCanBurn from 'hooks/useGetCanBurn';
import useGetSnxAmountToBeLiquidatedUsd from 'hooks/useGetSnxAmountToBeLiquidatedUsd';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { StakingPanelType } from 'store/staking';
import { sanitiseValue } from '../helper';
import InfoLayout from './InfoLayout';
import { getButtonDisplaying, getSelfLiquidationChanges } from './selfLiquidationInfoCalculations';

const SelfLiquidationInfo = () => {
  const {
    collateral,
    percentageTargetCRatio,
    percentageCurrentCRatio,
    stakedCollateral,
    debtBalance,
    SNXRate,
    balance: nonEscrowedBalance,
  } = useStakingCalculations();
  const { walletAddress } = Connector.useContainer();

  const { useSynthsBalancesQuery, useGetLiquidationDataQuery } = useSynthetixQueries();

  const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
  const canBurnQuery = useGetCanBurn(walletAddress);

  const sUSDBalance = synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? wei(0);
  const buttonDisplaying = getButtonDisplaying({
    sUSDBalance,
    debtBalance,
    percentageCurrentCRatio,
    percentageTargetCRatio,
    canBurn: canBurnQuery.data,
  });
  const liqData = useGetLiquidationDataQuery(walletAddress, {
    enabled: buttonDisplaying === 'SELF_LIQUIDATION_BUTTON',
  });
  const selfLiquidationPenalty = liqData.data?.selfLiquidationPenalty || wei(0);

  const collateralUSDValue = SNXRate.gt(0) ? collateral.mul(SNXRate) : undefined;
  const liquidationAmount = useGetSnxAmountToBeLiquidatedUsd(
    debtBalance,
    collateralUSDValue,
    selfLiquidationPenalty,
    liqData.data?.liquidationPenalty,
    buttonDisplaying === 'SELF_LIQUIDATION_BUTTON'
  );
  const usdToBeLiquidatedWithPenalty = liquidationAmount.data?.amountToSelfLiquidateUsd || wei(0);
  const { changedCRatio, changedCollateral, changedDebt } = getSelfLiquidationChanges({
    collateral,
    stakedCollateral,
    debtBalance,
    SNXRate,
    nonEscrowedBalance,
    sUSDBalance,
    selfLiquidationPenalty,
    usdToBeLiquidatedWithPenalty,
    buttonDisplaying,
  });
  const { t } = useTranslation();
  const stakingInfo = useMemo(() => {
    return {
      barRows: [],
      dataRows: [
        {
          title: t('staking.info.table.staked'),
          value: sanitiseValue(stakedCollateral),
          changedValue: changedCollateral,

          currencyKey: CryptoCurrency.SNX,
        },
        {
          title: t('staking.info.table.c-ratio'),
          value: percentageCurrentCRatio.eq(0)
            ? wei(0)
            : sanitiseValue(percentageCurrentCRatio.mul(100)),
          changedValue: sanitiseValue(changedCRatio.mul(100)),
          currencyKey: '%',
        },
        {
          title: t('staking.info.table.susd-balance'),
          value: sanitiseValue(sUSDBalance),
          changedValue: wei(0),
        },
        {
          title: t('staking.info.table.debt'),
          value: sanitiseValue(debtBalance),
          changedValue: changedDebt,
          currencyKey: Synths.sUSD,
        },
      ],
    };
  }, [
    changedCRatio,
    changedCollateral,
    changedDebt,
    debtBalance,
    percentageCurrentCRatio,
    sUSDBalance,
    stakedCollateral,
    t,
  ]);
  return (
    <InfoLayout
      targetCratioPercent={percentageTargetCRatio}
      stakingInfo={stakingInfo}
      isInputEmpty={buttonDisplaying === undefined}
      collateral={collateral}
      infoType={StakingPanelType.SELF_LIQUIDATE}
    />
  );
};
export default SelfLiquidationInfo;
