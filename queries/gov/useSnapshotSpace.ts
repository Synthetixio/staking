import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import axios from 'axios';

import QUERY_KEYS from 'constants/queryKeys';
import { COUNCIL_SPACE, PROPOSAL_SPACE } from 'constants/snapshot';

import { appReadyState } from 'store/app';

export enum SPACES {
	COUNCIL = 'council',
	PROPOSAL = 'proposal',
}

type SpaceStrategy = {
	name: string;
	params: {
		address: string;
		decimals: number;
		symbol: string;
	};
};

type SpaceData = {
	domain: string;
	filters: {
		defaultTab: string;
		invalids: string[];
		minScore: number;
	};
	members: string[];
	name: string;
	network: string;
	skin: string;
	stratgies: SpaceStrategy[];
	symbol: string;
};

const useSnapshotSpace = (spaceKey: SPACES, options?: QueryConfig<SpaceData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	return useQuery<SpaceData>(
		QUERY_KEYS.Gov.SnapshotSpace(spaceKey),
		async () => {
			let response;
			if (spaceKey === SPACES.COUNCIL) {
				response = await axios.get(COUNCIL_SPACE);
			} else {
				response = await axios.get(PROPOSAL_SPACE);
			}

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
