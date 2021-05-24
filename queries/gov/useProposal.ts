import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';

import { getProfiles } from 'sections/gov/components/helper';

import { appReadyState } from 'store/app';
import { walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import snapshot from '@snapshot-labs/snapshot.js';
import CouncilDilution from 'contracts/councilDilution.js';
import { ethers } from 'ethers';
import { uniqBy } from 'lodash';
import { SpaceData, Vote, SpaceStrategy, Proposal } from './types';
import request, { gql } from 'graphql-request';

export type ProposalResults = {
	totalBalances: number[];
	totalScores: any;
	totalVotes: number[];
	totalVotesBalances: number;
	choices: string[];
	spaceSymbol: string;
	voteList: any[];
};

const useProposal = (spaceKey: SPACE_KEY, hash: string, options?: QueryConfig<ProposalResults>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { provider } = Connector.useContainer();

	return useQuery<ProposalResults>(
		QUERY_KEYS.Gov.Proposal(spaceKey, hash),
		async () => {
			const { getAddress } = ethers.utils;

			const { proposal }: { proposal: Proposal } = await request(
				snapshotEndpoint,
				gql`
					query Proposal($id: String) {
						proposal(id: $id) {
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
				{ id: hash }
			);

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

			const block = parseInt(proposal.snapshot);
			const currentBlock = provider?.getBlockNumber() ?? 0;
			const blockTag = block > currentBlock ? 'latest' : block;

			/* Get scores and ENS/3Box profiles */
			const [scores, profiles] = await Promise.all([
				snapshot.utils.getScores(
					spaceKey,
					space.strategies,
					space.network,
					provider,
					voterAddresses,
					blockTag
				),
				getProfiles(voterAddresses),
			]);

			interface MappedVotes extends Vote {
				profile: {
					ens: string;
					address: string;
				};
				scores: number[];
				balance: number;
			}

			let mappedVotes = votes as MappedVotes[];

			mappedVotes = uniqBy(
				mappedVotes
					.map((vote) => {
						vote.scores = space.strategies.map(
							(_: SpaceStrategy, key: number) => scores[key][getAddress(vote.voter)] || 0
						);
						vote.balance = vote.scores.reduce((a: number, b: number) => a + b, 0);
						vote.profile = profiles[getAddress(vote.voter)];
						return vote;
					})
					.filter((vote) => vote.balance > 0)
					.sort((a, b) => b.balance - a.balance),
				(a) => getAddress(a.voter)
			);

			/* Apply dilution penalties for SIP/SCCP pages */
			if (spaceKey === SPACE_KEY.PROPOSAL) {
				const contract = new ethers.Contract(
					CouncilDilution.address,
					CouncilDilution.abi,
					provider as any
				);
				mappedVotes = await Promise.all(
					mappedVotes.map(async (vote) => {
						const dilutedValueBN = await contract.getDilutedWeightForProposal(
							hash,
							getAddress(vote.voter)
						);
						const diluteValueNumber = Number(ethers.utils.formatEther(dilutedValueBN));

						const dilutedResult = vote.balance * diluteValueNumber;
						return {
							...vote,
							balance: dilutedResult,
							scores: [dilutedResult],
						};
					})
				);
			}

			const returnVoteHistory = () => {
				if (walletAddress && voterAddresses.includes(getAddress(walletAddress))) {
					const index = mappedVotes.findIndex(
						(a) => getAddress(a.voter) === getAddress(walletAddress)
					);
					const currentUserVote = mappedVotes[index];
					mappedVotes.splice(index, 1);
					mappedVotes.unshift(currentUserVote);
				}
				return mappedVotes;
			};

			const voteList = returnVoteHistory();

			const results = {
				totalVotes: proposal.choices.map(
					(_: string, i: number) => mappedVotes.filter((vote) => vote.choice === i + 1).length
				),
				totalBalances: proposal.choices.map((_: string, i: number) =>
					mappedVotes.filter((vote) => vote.choice === i + 1).reduce((a, b) => a + b.balance, 0)
				),
				totalScores: proposal.choices.map((_: string, i: number) =>
					space.strategies.map((_, sI) =>
						mappedVotes
							.filter((vote) => vote.choice === i + 1)
							.reduce((a, b) => a + b.scores[sI], 0)
					)
				),
				totalVotesBalances: mappedVotes.reduce((a, b) => a + b.balance, 0),
				choices: proposal.choices,
				spaceSymbol: space.symbol,
				voteList: voteList,
			};

			return results;
		},
		{
			enabled: isAppReady && spaceKey,
			refetchInterval: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			...options,
		}
	);
};

export default useProposal;
