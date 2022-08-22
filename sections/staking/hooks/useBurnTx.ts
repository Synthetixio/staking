import { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { delegateWalletState } from 'store/wallet';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { amountToBurnState, BurnActionType, burnTypeState } from 'store/staking';
import { addSeconds, differenceInSeconds } from 'date-fns';

import Connector from 'containers/Connector';
import useClearDebtCalculations from 'sections/staking/hooks/useClearDebtCalculations';
import { useTranslation } from 'react-i18next';
import { toFutureDate } from 'utils/formatters/date';
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import { parseSafeWei } from 'utils/parse';
import { formatBytes32String } from 'ethers/lib/utils';

const useBurnTx = () => {
  const [amountToBurn, onBurnChange] = useRecoilState(amountToBurnState);
  const [burnType, onBurnTypeChange] = useRecoilState(burnTypeState);

  const { useSynthsBalancesQuery, useETHBalanceQuery, useSynthetixTxn, useEVMTxn } =
    useSynthetixQueries();

  const {
    percentageTargetCRatio,
    debtBalance,
    issuableSynths,
    targetCRatio,
    SNXRate,
    currentCRatio,
    refetch,
  } = useStakingCalculations();

  const { synthetixjs, walletAddress } = Connector.useContainer();
  const delegateWallet = useRecoilValue(delegateWalletState);
  const { t } = useTranslation();

  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
  const [waitingPeriod, setWaitingPeriod] = useState(0);
  const [issuanceDelay, setIssuanceDelay] = useState(0);
  const walletAddressToUse = delegateWallet?.address ?? walletAddress;
  const synthsBalancesQuery = useSynthsBalancesQuery(walletAddressToUse);
  const synthBalances =
    synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
      ? synthsBalancesQuery.data
      : null;

  const sUSDBalance = synthBalances?.balancesMap.sUSD
    ? synthBalances.balancesMap.sUSD.balance
    : wei(0);

  const { needToBuy, debtBalanceWithBuffer, missingSUSDWithBuffer, quoteAmount, swapData } =
    useClearDebtCalculations(debtBalance, sUSDBalance, walletAddress!);

  const ethBalanceQuery = useETHBalanceQuery(walletAddressToUse);
  const ethBalance = ethBalanceQuery.data ?? wei(0);

  const amountToBurnBN = Wei.max(wei(0), parseSafeWei(amountToBurn, wei(0)));

  const isToTarget = burnType === BurnActionType.TARGET;

  const getMaxSecsLeftInWaitingPeriod = useCallback(async () => {
    if (!synthetixjs) return;
    if (!walletAddressToUse) return;
    const {
      contracts: { Exchanger },
    } = synthetixjs;

    try {
      const maxSecsLeftInWaitingPeriod = await Exchanger.maxSecsLeftInWaitingPeriod(
        walletAddressToUse,
        formatBytes32String('sUSD')
      );
      setWaitingPeriod(Number(maxSecsLeftInWaitingPeriod));
    } catch (e) {
      console.log(e);
    }
  }, [synthetixjs, walletAddressToUse]);

  const getIssuanceDelay = useCallback(async () => {
    if (!synthetixjs) return;
    if (!walletAddressToUse) return;
    const {
      contracts: { Issuer },
    } = synthetixjs;
    try {
      const [canBurnSynths, lastIssueEvent, minimumStakeTime] = await Promise.all([
        Issuer.canBurnSynths(walletAddressToUse),
        Issuer.lastIssueEvent(walletAddressToUse),
        Issuer.minimumStakeTime(),
      ]);

      if (Number(lastIssueEvent) && Number(minimumStakeTime)) {
        const burnUnlockDate = addSeconds(Number(lastIssueEvent) * 1000, Number(minimumStakeTime));
        const issuanceDelayInSeconds = differenceInSeconds(burnUnlockDate, new Date());
        setIssuanceDelay(
          issuanceDelayInSeconds > 0 ? issuanceDelayInSeconds : canBurnSynths ? 0 : 1
        );
      }
    } catch (e) {
      console.log(e);
    }
    // eslint-disable-next-line
  }, [walletAddress, debtBalance, delegateWallet, synthetixjs]);

  const burnCall: [string, any[]] = !!delegateWallet
    ? isToTarget
      ? ['burnSynthsToTargetOnBehalf', [delegateWallet.address]]
      : ['burnSynthsOnBehalf', [delegateWallet.address, amountToBurnBN.toBN()]]
    : isToTarget
    ? ['burnSynthsToTarget', []]
    : ['burnSynths', [amountToBurnBN.toBN()]];

  const swapTxn = useEVMTxn(swapData, {
    onSuccess: () => txn.mutate(),
    enabled: true,
  });

  const txn = useSynthetixTxn('Synthetix', burnCall[0], burnCall[1], gasPrice, {
    enabled:
      (burnType !== BurnActionType.CLEAR || !needToBuy || swapTxn.txnStatus === 'confirmed') &&
      Boolean(amountToBurnBN),
    onSuccess: () => {
      synthsBalancesQuery.refetch();
      refetch();
    },
  });

  useEffect(() => {
    if (swapTxn.txnStatus === 'prompting' || txn.txnStatus === 'prompting') setTxModalOpen(true);
  }, [txn, swapTxn.txnStatus]);

  useEffect(() => {
    getMaxSecsLeftInWaitingPeriod();
    getIssuanceDelay();
  }, [getMaxSecsLeftInWaitingPeriod, getIssuanceDelay]);

  const maxBurnAmount = debtBalance.gt(sUSDBalance) ? wei(sUSDBalance) : debtBalance;

  let error: string | null = null;

  if (debtBalance.eq(0)) error = t('staking.actions.burn.action.error.no-debt');
  else if (
    ((!!amountToBurn && wei(amountToBurn).gt(sUSDBalance)) || maxBurnAmount.eq(0)) &&
    burnType !== BurnActionType.CLEAR
  )
    error = t('staking.actions.burn.action.error.insufficient');
  else if (burnType === BurnActionType.CLEAR && wei(quoteAmount).gt(ethBalance)) {
    error = t('staking.actions.burn.action.error.insufficient-eth-1inch');
  } else if (waitingPeriod) {
    error = t('staking.actions.burn.action.error.waiting-period', {
      date: toFutureDate(waitingPeriod),
    });
  } else if (issuanceDelay && burnType !== BurnActionType.TARGET) {
    error = t('staking.actions.burn.action.error.issuance-period', {
      date: toFutureDate(issuanceDelay),
    });
  }

  return {
    debtBalance,
    sUSDBalance,
    issuableSynths,
    onBurnChange,
    txn,
    burnType,
    needToBuy,
    amountToBurn,
    onBurnTypeChange,
    debtBalanceWithBuffer,
    swapTxn,
    quoteAmount,
    missingSUSDWithBuffer,
    percentageTargetCRatio,
    error,
    txModalOpen,
    setTxModalOpen,
    setGasPrice,
    isWalletConnected: !!walletAddress,
    targetCRatio,
    SNXRate,
    currentCRatio,
  };
};

export default useBurnTx;
