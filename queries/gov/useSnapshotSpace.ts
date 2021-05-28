import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { request, gql } from 'graphql-request';

import QUERY_KEYS from 'constants/queryKeys';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { SpaceData } from './types';

const useSnapshotSpace = (spaceKey: SPACE_KEY, options?: QueryConfig<SpaceData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	return useQuery<SpaceData>(
		QUERY_KEYS.Gov.SnapshotSpace(spaceKey),
		async () => {
			const { space }: { space: SpaceData } = await request(
				snapshotEndpoint,
				gql`
					query Space($spaceKey: String) {
						space(id: $spaceKey) {
							domain
							about
							members
							name
							network
							skin
							symbol
							strategies {
								name
								params
							}
							filters {
								minScore
								onlyMembers
							}
						}
					}
				`,
				{ spaceKey: spaceKey }
			);

			return space;
		},
		{
			enabled: isAppReady && spaceKey,
			refetchInterval: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			...options,
		}
	);
};

export default useSnapshotSpace;
