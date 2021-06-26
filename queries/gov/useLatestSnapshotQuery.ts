import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import QUERY_KEYS from 'constants/queryKeys';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';
import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';
import request, { gql } from 'graphql-request';
import { Proposal } from './types';
import { electionAuthor } from './constants';

type LatestSnapshotResult = {
	latestSnapshot: string;
};

const useLatestSnapshotQuery = (options?: QueryConfig<LatestSnapshotResult>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);

	return useQuery<LatestSnapshotResult>(
		QUERY_KEYS.Gov.LatestSnapshot,
		async () => {
			const { proposals }: { proposals: Proposal[] } = await request(
				snapshotEndpoint,
				gql`
					query LatestSnapshot($councilKey: String, $author: String) {
						proposals(
							first: 1
							where: { space: $councilKey, author: $author }
							orderBy: "created"
							orderDirection: desc
						) {
							snapshot
						}
					}
				`,
				{
					councilKey: SPACE_KEY.COUNCIL,
					author: electionAuthor,
				}
			);

			return {
				latestSnapshot: proposals[0].snapshot ?? 0,
			};
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

export default useLatestSnapshotQuery;
