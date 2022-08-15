import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useRecoilValue } from 'recoil';

import { amountToBurnState, StakingPanelType } from 'store/staking';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

import { CryptoCurrency, Synths } from 'constants/currency';

import { getStakingAmount, getTransferableAmountFromBurn, sanitiseValue } from '../helper';

import InfoLayout from './InfoLayout';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { parseSafeWei } from 'utils/parse';
import Connector from 'containers/Connector';

const StakingInfo: FC = () => {
  const { t } = useTranslation();
  const {
    debtBalance,
    targetCRatio,
    currentCRatio,
    transferableCollateral,
    stakedCollateral,
    SNXRate,
    issuableSynths,
    debtEscrowBalance,
    collateral,
  } = useStakingCalculations();

  const { walletAddress } = Connector.useContainer();

  const { useSynthsBalancesQuery } = useSynthetixQueries();

  const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);

  const amountToBurn = useRecoilValue(amountToBurnState);

  const sUSDBalance = synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? wei(0);

  const Rows = useMemo(() => {
    const calculatedTargetBurn = Math.max(debtBalance.sub(issuableSynths).toNumber(), 0);

    const amountToBurnWei = parseSafeWei(amountToBurn, 0);
    // When users use BURN MAX we send off the complete sUSD balance to the contract
    // The contract will only burn whats needed. We do this to avoid sUSD dust in the wallet.
    // When the sUSD balance is bigger than the debt balance these calculations will be wrong
    // So, when that's the case, use the debt balance for the calculations
    const amountToBurnForCalculation = amountToBurnWei.gt(debtBalance)
      ? debtBalance
      : amountToBurnWei;
    let unlockedStakeAmount;

    if (currentCRatio.gt(targetCRatio) && amountToBurnForCalculation.lte(calculatedTargetBurn)) {
      unlockedStakeAmount = wei(0);
    } else {
      unlockedStakeAmount = getStakingAmount(targetCRatio, amountToBurnForCalculation, SNXRate);
    }

    const changedStakedValue = stakedCollateral.eq(0)
      ? wei(0)
      : stakedCollateral.sub(unlockedStakeAmount);

    const changedTransferable = getTransferableAmountFromBurn(
      amountToBurnForCalculation,
      debtEscrowBalance,
      targetCRatio,
      SNXRate,
      transferableCollateral
    );

    const changedDebt = debtBalance.eq(0) ? wei(0) : debtBalance.sub(amountToBurnForCalculation);

    const changedSUSDBalance = sUSDBalance.sub(amountToBurnForCalculation);

    const changeCRatio = currentCRatio.neg(); // wei(100).div(changedDebt.div(SNXRate).div(collateral));

    return {
      barRows: [
        {
          title: t('staking.info.table.staked'),
          value: sanitiseValue(stakedCollateral),
          changedValue: sanitiseValue(changedStakedValue),
          percentage: collateral.eq(0) ? wei(0) : sanitiseValue(stakedCollateral).div(collateral),
          changedPercentage: collateral.eq(0)
            ? wei(0)
            : sanitiseValue(changedStakedValue).div(collateral),
          currencyKey: CryptoCurrency.SNX,
        },
        {
          title: t('staking.info.table.transferable'),
          value: sanitiseValue(transferableCollateral),
          changedValue: sanitiseValue(changedTransferable),
          percentage: collateral.eq(0)
            ? wei(0)
            : sanitiseValue(transferableCollateral).div(sanitiseValue(collateral)),
          changedPercentage: collateral.eq(0)
            ? wei(0)
            : sanitiseValue(changedTransferable).div(sanitiseValue(collateral)),
          currencyKey: CryptoCurrency.SNX,
        },
      ],
      dataRows: [
        {
          title: t('staking.info.table.c-ratio'),
          value: currentCRatio.eq(0) ? wei(0) : sanitiseValue(wei(100).div(currentCRatio)),
          changedValue: sanitiseValue(changeCRatio),
          currencyKey: '%',
        },
        {
          title: t('staking.info.table.susd-balance'),
          value: sanitiseValue(sUSDBalance),
          changedValue: sanitiseValue(changedSUSDBalance),
          currencyKey: Synths.sUSD,
        },
        {
          title: t('staking.info.table.debt'),
          value: sanitiseValue(debtBalance),
          changedValue: sanitiseValue(changedDebt),
          currencyKey: Synths.sUSD,
        },
      ],
    };
  }, [
    amountToBurn,
    t,
    SNXRate,
    currentCRatio,
    debtBalance,
    stakedCollateral,
    targetCRatio,
    transferableCollateral,
    issuableSynths,
    collateral,
    debtEscrowBalance,
    sUSDBalance,
  ]);

  const isInputEmpty = amountToBurn.length === 0;

  return (
    <InfoLayout
      stakingInfo={Rows}
      isInputEmpty={isInputEmpty}
      collateral={collateral}
      infoType={StakingPanelType.CLEAR}
    />
  );
};

export default StakingInfo;
