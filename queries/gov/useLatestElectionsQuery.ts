import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import QUERY_KEYS from 'constants/queryKeys';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';
import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';
import request, { gql } from 'graphql-request';
import { Proposal } from './types';

enum ProposalStates {
	ACTIVE = 'active',
	CLOSED = 'closed',
}

const useLatestElectionsQuery = (options?: QueryConfig<Proposal[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isL2 = useRecoilValue(isL2State);

	return useQuery<Proposal[]>(
		QUERY_KEYS.Gov.LatestElections(walletAddress ?? '', network?.id!),
		async () => {
			const author = '0xAFe05574a3653cdE39c8Fb842f761F5326Aa424A';

			const { proposals }: { proposals: Proposal[] } = await request(
				snapshotEndpoint,
				gql`
					query LatestElections(
						$councilKey: String
						$ambassadorKey: String
						$grantKey: String
						$state: String
						$author: String
					) {
						proposals(
							first: 3
							where: {
								space_in: [$councilKey, $ambassadorKey, $grantKey]
								author: $author
								state: $state
							}
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
					councilKey: SPACE_KEY.COUNCIL,
					ambassadorKey: SPACE_KEY.AMBASSADOR,
					grantKey: SPACE_KEY.GRANTS,
					state: ProposalStates.ACTIVE,
					author: author,
				}
			);
			return proposals;
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

export default useLatestElectionsQuery;
