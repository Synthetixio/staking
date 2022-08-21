import { useCallback, useMemo } from 'react';

import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { useRecoilValue } from 'recoil';
import { delegateWalletState } from 'store/wallet';
import Connector from 'containers/Connector';

const useStakingCalculations = () => {
  const { walletAddress } = Connector.useContainer();
  const delegateWallet = useRecoilValue(delegateWalletState);

  const {
    useExchangeRatesQuery,
    useGetDebtDataQuery,
    useEscrowDataQuery,
    useTokenSaleEscrowQuery,
  } = useSynthetixQueries();

  const {
    data: exchangeRateData,
    refetch: exchangeRateRefetch,
    isLoading: exchangeRateLoading,
  } = useExchangeRatesQuery();

  const {
    data: debtDataInfo,
    refetch: debtDataRefetch,
    isLoading: debtDataLoading,
  } = useGetDebtDataQuery(delegateWallet?.address ?? walletAddress);

  const {
    data: rewardsEscrowData,
    refetch: rewardsEscrowRefetch,
    isLoading: rewardsEscrowLoading,
  } = useEscrowDataQuery(delegateWallet?.address ?? walletAddress);

  const {
    data: tokenSaleEscrowData,
    refetch: tokenSaleEscrowRefetch,
    isLoading: tokenSaleEscrowLoading,
  } = useTokenSaleEscrowQuery(delegateWallet?.address ?? walletAddress);

  const debtData = debtDataInfo ?? null;
  const exchangeRates = exchangeRateData ?? null;
  const rewardEscrowBalance = rewardsEscrowData ?? null;
  const tokenSaleEscrowBalance = tokenSaleEscrowData ?? null;

  const isLoading =
    exchangeRateLoading || debtDataLoading || rewardsEscrowLoading || tokenSaleEscrowLoading;

  const results = useMemo(() => {
    const SNXRate = wei(exchangeRates?.SNX ?? 0);
    const collateral = wei(debtData?.collateral ?? 0);
    const targetCRatio = wei(debtData?.targetCRatio ?? 0);
    const targetThreshold = wei(debtData?.targetThreshold ?? 0);
    const currentCRatio = wei(debtData?.currentCRatio ?? 0);
    const transferableCollateral = wei(debtData?.transferable ?? 0);
    const debtBalance = wei(debtData?.debtBalance ?? 0);
    const stakingEscrow = wei(rewardEscrowBalance?.totalEscrowed ?? 0);
    const tokenSaleEscrow = wei(tokenSaleEscrowBalance?.totalEscrowed ?? 0);
    const issuableSynths = wei(debtData?.issuableSynths ?? 0);
    const balance = wei(debtData?.balance ?? 0);

    const stakedCollateral = targetCRatio.gt(0)
      ? collateral.mul(Wei.min(wei(1), currentCRatio.div(targetCRatio)))
      : wei(0);

    const stakedCollateralValue = stakedCollateral.mul(SNXRate);
    const lockedCollateral = collateral.sub(transferableCollateral);
    const unstakedCollateral = collateral.sub(stakedCollateral);
    const totalEscrowBalance = stakingEscrow.add(tokenSaleEscrow);

    const debtEscrowBalance = Wei.max(
      debtBalance.add(totalEscrowBalance.mul(SNXRate).mul(targetCRatio)).sub(issuableSynths),
      wei(0)
    );

    const percentageCurrentCRatio = currentCRatio.eq(0) ? wei(0) : wei(1).div(currentCRatio);
    const percentageTargetCRatio = targetCRatio.eq(0) ? wei(0) : wei(1).div(targetCRatio);
    const percentCurrentCRatioOfTarget = percentageTargetCRatio.eq(0)
      ? wei(0)
      : percentageCurrentCRatio.div(percentageTargetCRatio);

    return {
      collateral,
      targetCRatio,
      targetThreshold,
      percentageTargetCRatio,
      currentCRatio,
      percentageCurrentCRatio,
      transferableCollateral,
      debtBalance,
      stakedCollateral,
      stakedCollateralValue,
      lockedCollateral,
      unstakedCollateral,
      SNXRate,
      totalEscrowBalance,
      issuableSynths,
      percentCurrentCRatioOfTarget,
      stakingEscrow,
      debtEscrowBalance,
      balance,
      isLoading,
    };
  }, [debtData, exchangeRates, rewardEscrowBalance, tokenSaleEscrowBalance, isLoading]);

  const refetch = useCallback(() => {
    debtDataRefetch();
    exchangeRateRefetch();
    rewardsEscrowRefetch();
    tokenSaleEscrowRefetch();
  }, [debtDataRefetch, exchangeRateRefetch, rewardsEscrowRefetch, tokenSaleEscrowRefetch]);

  return { ...results, refetch };
};

export default useStakingCalculations;
