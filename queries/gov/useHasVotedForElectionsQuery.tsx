import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import snapshot from '@snapshot-labs/snapshot.js';

import QUERY_KEYS from 'constants/queryKeys';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { walletAddressState } from 'store/wallet';
import request, { gql } from 'graphql-request';
import { Proposal, SpaceData, SpaceStrategy } from './types';
import Connector from 'containers/Connector';
import { getAddress } from 'ethers/lib/utils';
import { electionAuthor } from './constants';

enum ProposalStates {
	ACTIVE = 'active',
	CLOSED = 'closed',
}

type HasVotedResult = {
	hasVoted: boolean;
};

const useHasVotedForElectionsQuery = (options?: QueryConfig<HasVotedResult>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { provider } = Connector.useContainer();

	return useQuery<HasVotedResult>(
		QUERY_KEYS.Gov.HasVotedForElections(walletAddress ?? ''),
		async () => {
			try {
				const { proposals }: { proposals: Proposal[] } = await request(
					snapshotEndpoint,
					gql`
						query LatestElections(
							$councilKey: String
							$ambassadorKey: String
							$grantKey: String
							$state: String
							$author: String
						) {
							proposals(
								first: 3
								where: {
									space_in: [$councilKey, $ambassadorKey, $grantKey]
									author: $author
									state: $state
								}
								orderBy: "created"
								orderDirection: desc
							) {
								id
								snapshot
							}
						}
					`,
					{
						councilKey: SPACE_KEY.COUNCIL,
						ambassadorKey: SPACE_KEY.AMBASSADOR,
						grantKey: SPACE_KEY.GRANTS,
						state: ProposalStates.ACTIVE,
						author: electionAuthor,
					}
				);

				// @notice Three DAO elections not currently active
				if (proposals.length < 3 || !proposals[0]) {
					return { hasVoted: true };
				}

				const latestSnapshot = proposals[0].snapshot;

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
					{ spaceKey: SPACE_KEY.COUNCIL }
				);

				const scores = await snapshot.utils.getScores(
					SPACE_KEY.COUNCIL,
					space.strategies,
					space.network,
					provider,
					[getAddress(walletAddress ?? '')],
					latestSnapshot
				);

				const totalScore = space.strategies.map(
					(_: SpaceStrategy, key: number) => scores[key][getAddress(walletAddress ?? '')]
				);

				const totalWeight = totalScore.reduce((a: number, b: number) => a ?? 0 + b ?? 0);

				//@notice user has no voting weight
				if (totalWeight === 0) {
					return {
						hasVoted: true,
					};
				}

				const electionHashes = proposals.map((e) => e.id);

				const { votes } = await request(
					snapshotEndpoint,
					gql`
						query VotesForElections($electionHashes: [String!]!, $userAddress: String) {
							votes(where: { proposal_in: $electionHashes, voter: $userAddress }) {
								voter
								created
							}
						}
					`,
					{
						electionHashes: electionHashes,
						userAddress: walletAddress,
					}
				);
				if (votes.length === 3) {
					return { hasVoted: true };
				} else {
					return { hasVoted: false };
				}
			} catch (error) {
				console.log(error);
				return { hasVoted: true };
			}
		},
		{
			enabled: isAppReady && walletAddress,
			refetchInterval: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			...options,
		}
	);
};

export default useHasVotedForElectionsQuery;
