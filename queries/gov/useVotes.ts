import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import axios from 'axios';

import QUERY_KEYS from 'constants/queryKeys';
import { PROPOSAL, SPACE_KEY } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { Vote } from './types';
import { networkState, walletAddressState } from 'store/wallet';

const useVotes = (spaceKey: SPACE_KEY, hash: string, options?: QueryConfig<Vote[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<Vote[]>(
		QUERY_KEYS.Gov.Proposal(spaceKey, hash, walletAddress ?? '', network?.id!),
		async () => {
			const { data } = await axios.get(PROPOSAL(spaceKey, hash));

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
