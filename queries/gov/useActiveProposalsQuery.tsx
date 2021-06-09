import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { SPACE_KEY, snapshotEndpoint } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { Proposal } from './types';
import { isL2State, networkState, walletAddressState } from 'store/wallet';
import request, { gql } from 'graphql-request';

const useActiveProposalsQuery = (options?: UseQueryOptions<number>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const isL2 = useRecoilValue(isL2State);

	return useQuery<number>(
		QUERY_KEYS.Gov.ActiveProposals(walletAddress ?? '', network?.id!),
		async () => {
			const { proposals }: { proposals: Proposal[] } = await request(
				snapshotEndpoint,
				gql`
					query Proposals(
						$councilKey: String
						$ambassadorKey: String
						$grantKey: String
						$proposalKey: String
					) {
						proposals(
							first: 100
							skip: 0
							where: {
								space_in: [$councilKey, $ambassadorKey, $grantKey, $proposalKey]
								state: "active"
							}
						) {
							id
							state
							space {
								id
							}
						}
					}
				`,
				{
					councilKey: SPACE_KEY.COUNCIL,
					ambassadorKey: SPACE_KEY.AMBASSADOR,
					grantKey: SPACE_KEY.GRANTS,
					proposalKey: SPACE_KEY.PROPOSAL,
				}
			);

			return proposals.length;
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

export default useActiveProposalsQuery;
