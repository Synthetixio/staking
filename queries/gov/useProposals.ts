import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import axios from 'axios';

import QUERY_KEYS from 'constants/queryKeys';
import { COUNCIL_PROPOSALS, PROPOSAL_PROPOSALS } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { Proposal, SPACES } from './types';

const useProposals = (spaceKey: SPACES, options?: QueryConfig<Proposal[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	return useQuery<Proposal[]>(
		QUERY_KEYS.Gov.Proposals(spaceKey),
		async () => {
			let response;
			if (spaceKey === SPACES.COUNCIL) {
				response = await axios.get(COUNCIL_PROPOSALS);
			} else {
				response = await axios.get(PROPOSAL_PROPOSALS);
			}

			const { data } = response;

			let result = [] as Proposal[];

			for (var key in data) {
				const rest = data[key];

				result.push({
					proposalHash: key,
					...rest,
				});
			}

			return result;
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useProposals;
