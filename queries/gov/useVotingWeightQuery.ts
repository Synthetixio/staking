import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

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

				const currentBlock = provider?.getBlockNumber() ?? 0;
				const blockTag = block !== null && block > currentBlock ? 'latest' : block;

				const {
					scores: { scores },
				} = await request(
					snapshotEndpoint,
					gql`
						query Scores(
							$spaceKey: String
							$strategies: [Any]!
							$network: String!
							$addresses: [String]!
							$snapshot: Any
						) {
							scores(
								space: $spaceKey
								strategies: $strategies
								network: $network
								addresses: $addresses
								snapshot: $snapshot
							) {
								scores
							}
						}
					`,
					{
						spaceKey,
						strategies: space.strategies,
						network: space.network,
						addresses: [getAddress(walletAddress ?? '')],
						snapshot: blockTag,
					}
				);

				let arrayOfScores: number[];
				if (scores.length > 0) {
					arrayOfScores = space.strategies.map(
						(_: SpaceStrategy, key: number) => scores[key][getAddress(walletAddress)]
					);
				} else {
					arrayOfScores = [0, 0];
				}

				return arrayOfScores;
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
