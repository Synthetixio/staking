import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import snapshot from '@snapshot-labs/snapshot.js';

import QUERY_KEYS from 'constants/queryKeys';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import { ethers } from 'ethers';
import { SpaceData, SpaceStrategy } from './types';
import request, { gql } from 'graphql-request';

const useVotingWeightQuery = (
	spaceKey: SPACE_KEY,
	block: number | null,
	options?: QueryConfig<number[]>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { provider } = Connector.useContainer();

	return useQuery<number[]>(
		QUERY_KEYS.Gov.VotingWeight(spaceKey, block),
		async () => {
			if (walletAddress) {
				const { getAddress } = ethers.utils;
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

				const scores = await snapshot.utils.getScores(
					SPACE_KEY.COUNCIL,
					space.strategies,
					space.network,
					provider,
					[getAddress(walletAddress ?? '')],
					block
				);

				const totalScore = space.strategies.map(
					(_: SpaceStrategy, key: number) => scores[key][getAddress(walletAddress ?? '')] ?? 0
				);

				return totalScore;
			} else {
				return [0, 0];
			}
		},
		{
			enabled: isAppReady && spaceKey && walletAddress,
			refetchInterval: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			...options,
		}
	);
};

export default useVotingWeightQuery;
