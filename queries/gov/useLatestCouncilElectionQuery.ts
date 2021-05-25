import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import QUERY_KEYS from 'constants/queryKeys';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';
import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';
import request, { gql } from 'graphql-request';
import { Proposal } from './types';

const useLatestCouncilElectionQuery = (options?: QueryConfig<Proposal>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isL2 = useRecoilValue(isL2State);

	return useQuery<Proposal>(
		QUERY_KEYS.Gov.LatestCouncilElection(walletAddress ?? '', network?.id!),
		async () => {
			const { proposal }: { proposal: Proposal } = await request(
				snapshotEndpoint,
				gql`
					query Proposals($space: String) {
						proposals(
							first: 1
							where: { space: $space }
							orderBy: "created"
							orderDirection: desc
						) {
							id
							title
							body
							choices
							start
							end
							snapshot
							state
							author
							space {
								id
								name
							}
						}
					}
				`,
				{
					space: SPACE_KEY.COUNCIL,
				}
			);
			return proposal;
		},
		{
			enabled: isAppReady && !isL2,
			refetchInterval: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			...options,
		}
	);
};

export default useLatestCouncilElectionQuery;
