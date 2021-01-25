import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import axios from 'axios';

import QUERY_KEYS from 'constants/queryKeys';
import { COUNCIL_INDIVIDUAL_PROPOSAL, PROPOSAL_INDIVIDUAL_PROPOSAL } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { SPACES, Vote } from './types';

const useVotes = (spaceKey: SPACES, hash: string, options?: QueryConfig<Vote[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	return useQuery<Vote[]>(
		QUERY_KEYS.Gov.Proposal(spaceKey, hash),
		async () => {
			let response;
			if (spaceKey === SPACES.COUNCIL) {
				response = await axios.get(COUNCIL_INDIVIDUAL_PROPOSAL(hash));
			} else {
				response = await axios.get(PROPOSAL_INDIVIDUAL_PROPOSAL(hash));
			}

			const { data } = response;

			let result = [] as Vote[];

			for (var key in data) {
				const rest = data[key];

				result.push({
					address: key,
					...rest,
				});
			}

			return result;
		},
		{
			enabled: isAppReady && spaceKey && hash,
			...options,
		}
	);
};

export default useVotes;
