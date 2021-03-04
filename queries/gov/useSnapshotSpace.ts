import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import axios from 'axios';

import QUERY_KEYS from 'constants/queryKeys';
import { SPACE, SPACE_KEY } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { SpaceData } from './types';

const useSnapshotSpace = (spaceKey: SPACE_KEY, options?: QueryConfig<SpaceData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	return useQuery<SpaceData>(
		QUERY_KEYS.Gov.SnapshotSpace(spaceKey),
		async () => {
			const response = await axios.get(SPACE(spaceKey));

			const { data }: { data: SpaceData } = response;

			return data;
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useSnapshotSpace;
