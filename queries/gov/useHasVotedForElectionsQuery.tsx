import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { walletAddressState } from 'store/wallet';
import request, { gql } from 'graphql-request';
import { Proposal, SpaceData } from './types';

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

	return useQuery<HasVotedResult>(
		QUERY_KEYS.Gov.HasVotedForElections(walletAddress ?? ''),
		async () => {
			try {
				const author = '0xAFe05574a3653cdE39c8Fb842f761F5326Aa424A';

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
						author: author,
					}
				);

				// @notice No elections currenlty active
				if (proposals.length === 0) {
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
						spaceKey: SPACE_KEY.COUNCIL,
						strategies: space.strategies,
						network: space.network,
						addresses: [walletAddress],
						snapshot: latestSnapshot,
					}
				);

				const totalWeight = scores.reduce((a: number, b: number) => a + b);

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
