import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import axios from 'axios';

import QUERY_KEYS from 'constants/queryKeys';
import { PROPOSAL, SPACE, SPACE_KEY } from 'constants/snapshot';

import { getProfiles } from 'sections/gov/components/helper';

import { appReadyState } from 'store/app';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import snapshot from '@snapshot-labs/snapshot.js';
import CouncilDilution from 'contracts/councilDilution.js';
import { ethers } from 'ethers';
import { uniqBy } from 'lodash';
import { IpfsProposal, SpaceData, Votes, Vote, SpaceStrategy } from './types';

type ProposalResults = {
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
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const { provider } = Connector.useContainer();

	return useQuery<ProposalResults>(
		QUERY_KEYS.Gov.Proposal(spaceKey, hash),
		async () => {
			let [proposal, { voterAddresses, voterSignatures }, space]: [
				IpfsProposal,
				Votes,
				SpaceData
			] = await Promise.all([
				axios.get(`https://cloudflare-ipfs.com/ipfs/${hash}`).then((response) => {
					let proposal = response.data;
					proposal.msg = JSON.parse(proposal.msg);
					return proposal;
				}),
				axios.get(PROPOSAL(spaceKey, hash)).then((response) => {
					return {
						voterAddresses: Object.keys(response.data).map((address) =>
							address.toLowerCase()
						) as any,
						voterSignatures: Object.values(response.data) as any,
					};
				}),
				axios.get(SPACE(spaceKey)).then((response) => response.data),
			]);

			const block = parseInt(proposal.msg.payload.snapshot);
			const currentBlock = provider?.getBlockNumber() ?? 0;
			const blockTag = block > currentBlock ? 'latest' : block;

			/* Get scores and ENS/3Box profiles */
			const [scores, profiles]: any = await Promise.all([
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

			let mappedVotes = voterSignatures as MappedVotes[];

			mappedVotes = uniqBy(
				mappedVotes
					.map((vote) => {
						vote.scores = space.strategies.map(
							(_: SpaceStrategy, key: number) => scores[key][vote.address.toLowerCase()] || 0
						);
						vote.balance = vote.scores.reduce((a: number, b: number) => a + b, 0);
						vote.profile = profiles[vote.address.toLowerCase()];
						return vote;
					})
					.filter((vote) => vote.balance > 0)
					.sort((a, b) => b.balance - a.balance),
				(a) => a.address.toLowerCase()
			);

			/* Apply dilution penalties for SIP/SCCP pages */
			if (spaceKey === SPACE_KEY.PROPOSAL) {
				const contract = new ethers.Contract(
					CouncilDilution.address,
					CouncilDilution.abi,
					provider as any
				);
				mappedVotes = await Promise.all(
					mappedVotes.map(async (vote: any) => {
						const dilutedValueBN = await contract.getDilutedWeightForProposal(hash, vote.address);
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
				if (walletAddress && voterAddresses.includes(walletAddress.toLowerCase())) {
					const index = mappedVotes.findIndex(
						(a) => a.address.toLowerCase() === walletAddress.toLowerCase()
					);
					const currentUserVote = mappedVotes[index];
					mappedVotes.splice(index, 1);
					mappedVotes.unshift(currentUserVote);
				}
				return mappedVotes;
			};

			const results = {
				totalVotes: proposal.msg.payload.choices.map(
					(_: string, i: number) =>
						mappedVotes.filter((vote) => vote.msg.payload.choice === i + 1).length
				),
				totalBalances: proposal.msg.payload.choices.map((_: string, i: number) =>
					mappedVotes
						.filter((vote) => vote.msg.payload.choice === i + 1)
						.reduce((a, b) => a + b.balance, 0)
				),
				totalScores: proposal.msg.payload.choices.map((_: string, i: number) =>
					space.strategies.map((_, sI) =>
						mappedVotes
							.filter((vote) => vote.msg.payload.choice === i + 1)
							.reduce((a, b: any) => a + b.scores[sI], 0)
					)
				),
				totalVotesBalances: mappedVotes.reduce((a, b) => a + b.balance, 0),
				choices: proposal.msg.payload.choices,
				spaceSymbol: space.symbol,
				voteList: returnVoteHistory(),
			};

			return results;
		},
		{
			enabled: isAppReady && spaceKey && false,
			...options,
		}
	);
};

export default useProposal;
