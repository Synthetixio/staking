import useFeeClaimHistoryQuery from 'queries/staking/useFeeClaimHistoryQuery';
import useSynthBurnedQuery from 'queries/staking/useSynthBurnedQuery';
import useSynthIssuedQuery from 'queries/staking/useSynthIssuedQuery';

const useHistoryTransactions = () => {
	const issuedQuery = useSynthIssuedQuery();
	const burnedQuery = useSynthBurnedQuery();
	const feesClaimedQuery = useFeeClaimHistoryQuery();

	const isLoaded = issuedQuery.isSuccess && burnedQuery.isSuccess && feesClaimedQuery.isSuccess;
	const issued = issuedQuery.data ?? [];
	const burned = burnedQuery.data ?? [];
	const feesClaimed = feesClaimedQuery.data ?? [];

	const txCount = isLoaded ? issued.length + burned.length + feesClaimed.length : 0;

	return {
		txCount,
		isLoaded,
		issued,
		burned,
		feesClaimed,
	};
};

export default useHistoryTransactions;
