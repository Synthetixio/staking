import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { Synths } from 'constants/currency';
import useGetSnxAmountToBeLiquidatedUsd from 'hooks/useGetSnxAmountToBeLiquidatedUsd';
import { useRecoilValue } from 'recoil';
import { TabContainer } from 'sections/staking/components/common';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { delegateWalletState } from 'store/wallet';
import SelfLiquidationTabContent from './SelfLiquidationTabContent';
import Connector from 'containers/Connector';
import styled from 'styled-components';
import { FlexDivJustifyCenter } from 'styles/common';
import Loader from 'components/Loader';
import useGetCanBurn from 'hooks/useGetCanBurn';
import ConnectOrSwitchNetwork from 'components/ConnectOrSwitchNetwork';

const SelfLiquidateTab = () => {
  const { walletAddress, isWalletConnected } = Connector.useContainer();

  const {
    debtBalance,
    issuableSynths,
    percentageCurrentCRatio,
    percentageTargetCRatio,
    SNXRate,
    collateral,
    isLoading,
  } = useStakingCalculations();
  /**
   * Ideally the Issuer should always let us burn when we're burning an amount that wont get the c-ration back to target
   * But since it doesn't support this, we need to check that we actually can burn
   */
  const canBurnQuery = useGetCanBurn(walletAddress);
  const { useSynthsBalancesQuery, useGetLiquidationDataQuery } = useSynthetixQueries();
  const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
  const sUSDBalance = synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? wei(0);
  const liquidationDataQuery = useGetLiquidationDataQuery(walletAddress);
  const delegateWallet = useRecoilValue(delegateWalletState);

  const isDelegateWallet = Boolean(delegateWallet?.address);
  const canSelfLiquidate =
    percentageCurrentCRatio?.gt(0) &&
    percentageCurrentCRatio?.lt(percentageTargetCRatio) &&
    !isDelegateWallet;
  const liquidationAmountsToFixCollateralQuery = useGetSnxAmountToBeLiquidatedUsd(
    debtBalance,
    collateral.mul(SNXRate),
    liquidationDataQuery.data?.selfLiquidationPenalty,
    liquidationDataQuery.data?.liquidationPenalty,
    canSelfLiquidate
  );

  const burnAmountToFixCRatio = wei(Wei.max(debtBalance.sub(issuableSynths), wei(0)));
  if (!isWalletConnected || !walletAddress) {
    return (
      <ConnectWalletButtonWrapper>
        <ConnectOrSwitchNetwork />
      </ConnectWalletButtonWrapper>
    );
  }
  if (
    canBurnQuery.isLoading ||
    !liquidationDataQuery.data ||
    synthsBalancesQuery.isLoading ||
    isLoading
  ) {
    return (
      <FlexDivJustifyCenter>
        <Loader inline />
      </FlexDivJustifyCenter>
    );
  }

  return (
    <TabContainer>
      <SelfLiquidationTabContent
        percentageCurrentCRatio={percentageCurrentCRatio}
        percentageTargetCRatio={percentageTargetCRatio}
        burnAmountToFixCRatio={burnAmountToFixCRatio}
        sUSDBalance={sUSDBalance}
        selfLiquidationPenalty={liquidationDataQuery.data.selfLiquidationPenalty}
        liquidationPenalty={liquidationDataQuery.data.liquidationPenalty}
        walletAddress={walletAddress}
        isDelegateWallet={isDelegateWallet}
        SNXRate={SNXRate}
        canBurn={Boolean(canBurnQuery.data)}
        amountToSelfLiquidateUsd={
          liquidationAmountsToFixCollateralQuery.data?.amountToSelfLiquidateUsd
        }
      />
    </TabContainer>
  );
};
const ConnectWalletButtonWrapper = styled.div`
  width: 250px;
  margin: 0 auto;
`;
export default SelfLiquidateTab;
