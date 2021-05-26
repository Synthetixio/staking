import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { SPACE_KEY, snapshotEndpoint } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { Proposal, SpaceData, Vote } from './types';
import { networkState, walletAddressState } from 'store/wallet';
import snapshot from '@snapshot-labs/snapshot.js';
import Connector from 'containers/Connector';
import { ethers } from 'ethers';
import CouncilDilution from 'contracts/councilDilution.js';
import CouncilNominations from 'constants/nominations.json';
import request, { gql } from 'graphql-request';

const useProposals = (spaceKey: SPACE_KEY, options?: QueryConfig<Proposal[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { provider } = Connector.useContainer();

	const isL1 = !network?.useOvm ?? true;

	const contract = new ethers.Contract(
		CouncilDilution.address,
		CouncilDilution.abi,
		provider as any
	);

	return useQuery<Proposal[]>(
		QUERY_KEYS.Gov.Proposals(spaceKey, walletAddress ?? '', network?.id!),
		async () => {
			const { space, proposals }: { space: SpaceData; proposals: Proposal[] } = await request(
				snapshotEndpoint,
				gql`
					query ProposalsForSpace($spaceKey: String) {
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
						proposals(
							first: 10
							skip: 0
							where: { space: $spaceKey }
							orderBy: "created"
							orderDirection: desc
						) {
							id
							title
							body
							choices
							start
							end
							snapshot
							state
							author
							space {
								id
								name
							}
						}
					}
				`,
				{ spaceKey: spaceKey }
			);

			const proposalHashes = proposals.map((e: Proposal) => e.id);
			let validHashes: string[];

			if (spaceKey === SPACE_KEY.PROPOSAL) {
				const hashes = (await contract.getValidProposals(proposalHashes)) as string[];
				validHashes = hashes.filter((e) => e !== '').map((hash) => hash);
			} else if (spaceKey === SPACE_KEY.COUNCIL) {
				const nominationHashes = Object.keys(CouncilNominations);
				validHashes = proposalHashes
					.filter((e) => nominationHashes.includes(e))
					.map((hash) => hash);
			} else {
				validHashes = proposalHashes;
			}

			const mappedProposals = proposals.map(async (proposal) => {
				if (validHashes.includes(proposal.id)) {
					const block = parseInt(proposal.snapshot);
					const currentBlock = provider?.getBlockNumber() ?? 0;
					const blockTag = block > currentBlock ? 'latest' : block;

					const { votes }: { votes: Vote[] } = await request(
						snapshotEndpoint,
						gql`
							query Votes($proposal: String) {
								votes(first: 1000, where: { proposal: $proposal }) {
									id
									voter
									created
									proposal
									choice
								}
							}
						`,
						{ proposal: proposal.id }
					);

					const voterAddresses = votes.map((e: Vote) => ethers.utils.getAddress(e.voter));

					const [scores]: any = await Promise.all([
						snapshot.utils.getScores(
							spaceKey,
							space.strategies,
							space.network,
							provider,
							voterAddresses,
							blockTag
						),
					]);

					let voteCount = 0;

					space.strategies.forEach((_, i: number) => {
						let arrayOfVotes = Object.values(scores[i]) as number[];
						voteCount = voteCount + arrayOfVotes.filter((score: number) => score > 0).length;
					});

					return {
						...proposal,
						votes: voteCount,
					};
				} else {
					return null;
				}
			});
			const resolvedProposals = await Promise.all(mappedProposals);
			return resolvedProposals.filter((e) => e !== null) as Proposal[];
		},
		{
			enabled: isAppReady && spaceKey && isL1,
			refetchInterval: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			...options,
		}
	);
};

export default useProposals;
