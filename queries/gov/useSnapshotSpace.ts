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
			let space: SpaceData = await Promise.resolve(
				axios.get(SPACE(spaceKey)).then((response) => response.data)
			);
			return space;
		},
		{
			enabled: isAppReady && spaceKey && false,
			...options,
		}
	);
};

export default useSnapshotSpace;
