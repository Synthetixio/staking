import React, { useMemo, FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useRecoilValue } from 'recoil';

import { amountToMintState, StakingPanelType } from 'store/staking';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

import { CryptoCurrency, Synths } from 'constants/currency';

import { getStakingAmount, getTransferableAmountFromMint, sanitiseValue } from '../helper';
import InfoLayout from './InfoLayout';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { delegateWalletState } from 'store/wallet';
import { parseSafeWei } from 'utils/parse';
import Connector from 'containers/Connector';
import { BigNumber } from 'ethers';
import { useQuery } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';

const MintInfo: FC = () => {
  const { t } = useTranslation();
  const {
    unstakedCollateral,
    debtBalance,
    targetCRatio,
    currentCRatio,
    transferableCollateral,
    stakedCollateral,
    SNXRate,
    collateral,
    balance,
    percentageTargetCRatio,
  } = useStakingCalculations();
  const { synthetixjs, walletAddress } = Connector.useContainer();

  const delegateWallet = useRecoilValue(delegateWalletState);
  const walletToUse = delegateWallet?.address || walletAddress;
  const { useSynthsBalancesQuery, useGetLiquidationDataQuery } = useSynthetixQueries();
  const liquidationDataQuery = useGetLiquidationDataQuery(walletToUse);
  const synthsBalancesQuery = useSynthsBalancesQuery(walletToUse);

  const amountToMint = useRecoilValue(amountToMintState);

  const sUSDBalance = synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? wei(0);
  const minStakeTimeSecQuery = useQuery(
    QUERY_KEYS.Staking.MinimumStakeTime,
    async () => {
      if (!synthetixjs) return;
      const x: BigNumber = await synthetixjs.contracts.Issuer.minimumStakeTime();
      return x.toNumber();
    },
    { enabled: Boolean(synthetixjs) }
  );

  const Rows = useMemo(() => {
    const amountToMintBN = parseSafeWei(amountToMint, 0);

    const stakingAmount = getStakingAmount(targetCRatio, amountToMintBN, SNXRate);

    const mintAdditionalDebt = stakedCollateral.add(stakingAmount).mul(targetCRatio).mul(SNXRate);

    const changedStakedValue = stakedCollateral.add(stakingAmount);

    const changedTransferable = transferableCollateral.eq(0)
      ? wei(0)
      : getTransferableAmountFromMint(balance, changedStakedValue);

    const changedDebt = mintAdditionalDebt;

    const changedSUSDBalance = sUSDBalance.add(amountToMintBN);

    const changeCRatio = mintAdditionalDebt.gt(0)
      ? currentCRatio.lt(targetCRatio)
        ? unstakedCollateral.add(stakedCollateral).mul(SNXRate).div(mintAdditionalDebt).mul(100)
        : changedStakedValue.mul(SNXRate).div(mintAdditionalDebt).mul(100)
      : wei(0);

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
    amountToMint,
    t,
    SNXRate,
    currentCRatio,
    debtBalance,
    stakedCollateral,
    targetCRatio,
    transferableCollateral,
    unstakedCollateral,
    balance,
    collateral,
    sUSDBalance,
  ]);

  const isInputEmpty = amountToMint.length === 0;

  return (
    <InfoLayout
      targetCratioPercent={percentageTargetCRatio}
      liquidationRatioPercent={
        liquidationDataQuery.data?.liquidationRatio
          ? wei(1).div(liquidationDataQuery.data.liquidationRatio)
          : undefined
      }
      stakingInfo={Rows}
      isInputEmpty={isInputEmpty}
      collateral={collateral}
      infoType={StakingPanelType.MINT}
      minStakeTimeSec={minStakeTimeSecQuery.data}
    />
  );
};

export default MintInfo;
