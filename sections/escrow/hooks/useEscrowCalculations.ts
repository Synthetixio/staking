import { useMemo } from 'react';
import useEscrowDataQuery from 'queries/escrow/useEscrowDataQuery';
import useTokenSaleEscrowDateQuery from 'queries/escrow/useTokenSaleEscrowQuery';
import { BigNumber } from 'bignumber.js';
import { toBigNumber } from 'utils/formatters/number';

type EscrowCalculations = {
	totalEscrowBalance: BigNumber;
	totalClaimableBalance: BigNumber;
	totalVestedBalance: BigNumber;
};
const useStakingCalculations = (): EscrowCalculations => {
	const rewardEscrowQuery = useEscrowDataQuery();
	const tokenSaleEscrowQuery = useTokenSaleEscrowDateQuery();

	const rewardsEscrow = rewardEscrowQuery.data ?? null;
	const tokenSaleEscrow = tokenSaleEscrowQuery.data ?? null;

	const results = useMemo(() => {
		const stakingEscrowBalance = toBigNumber(rewardsEscrow?.totalEscrowed ?? 0);
		const stakingClaimableBalance = toBigNumber(rewardsEscrow?.claimableAmount ?? 0);
		const stakingVestedBalance = toBigNumber(rewardsEscrow?.totalVested ?? 0);

		const tokenSaleEscrowBalance = toBigNumber(tokenSaleEscrow?.totalEscrowed ?? 0);
		const tokenSaleClaimableBalance = toBigNumber(tokenSaleEscrow?.claimableAmount ?? 0);
		const tokenSaleVestedBalance = toBigNumber(tokenSaleEscrow?.totalVested ?? 0);

		const totalEscrowBalance = stakingEscrowBalance.plus(tokenSaleEscrowBalance);
		const totalClaimableBalance = stakingClaimableBalance.plus(tokenSaleClaimableBalance);
		const totalVestedBalance = stakingVestedBalance.plus(tokenSaleVestedBalance);

		return {
			totalEscrowBalance,
			totalClaimableBalance,
			totalVestedBalance,
		};
	}, [rewardsEscrow, tokenSaleEscrow]);

	return results;
};

export default useStakingCalculations;
