import { useMemo } from 'react';
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';
import Connector from 'containers/Connector';

type EscrowCalculations = {
  totalEscrowBalance: Wei;
  totalClaimableBalance: Wei;
  totalVestedBalance: Wei;
};
const useEscrowCalculations = (): EscrowCalculations => {
  const { walletAddress } = Connector.useContainer();

  const { useTokenSaleEscrowQuery, useEscrowDataQuery } = useSynthetixQueries();

  const rewardEscrowQuery = useEscrowDataQuery(walletAddress);
  const tokenSaleEscrowQuery = useTokenSaleEscrowQuery(walletAddress);

  const rewardsEscrow = rewardEscrowQuery.data ?? null;
  const tokenSaleEscrow = tokenSaleEscrowQuery.data ?? null;

  const results = useMemo(() => {
    const stakingEscrowBalance = wei(rewardsEscrow?.totalEscrowed ?? 0);
    const stakingClaimableBalance = wei(rewardsEscrow?.claimableAmount ?? 0);
    const stakingVestedBalance = wei(rewardsEscrow?.totalVested ?? 0);

    const tokenSaleEscrowBalance = wei(tokenSaleEscrow?.totalEscrowed ?? 0);
    const tokenSaleClaimableBalance = wei(tokenSaleEscrow?.claimableAmount ?? 0);
    const tokenSaleVestedBalance = wei(tokenSaleEscrow?.totalVested ?? 0);

    const totalEscrowBalance = stakingEscrowBalance.add(tokenSaleEscrowBalance);
    const totalClaimableBalance = stakingClaimableBalance.add(tokenSaleClaimableBalance);
    const totalVestedBalance = stakingVestedBalance.add(tokenSaleVestedBalance);

    return {
      totalEscrowBalance,
      totalClaimableBalance,
      totalVestedBalance,
    };
  }, [rewardsEscrow, tokenSaleEscrow]);

  return results;
};

export default useEscrowCalculations;
