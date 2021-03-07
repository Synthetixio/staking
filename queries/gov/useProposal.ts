import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import axios from 'axios';

import QUERY_KEYS from 'constants/queryKeys';
import {
	formatProposal,
	getProfiles,
	ipfsGet,
	PROPOSAL,
	SPACE,
	SPACE_KEY,
} from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import snapshot from '@snapshot-labs/snapshot.js';
import CouncilDilution from 'contracts/councilDilution.js';
import { ethers } from 'ethers';

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
	const { provider } = Connector.useContainer();

	return useQuery<ProposalResults>(
		QUERY_KEYS.Gov.Proposal(spaceKey, hash),
		async () => {
			const response = await Promise.all([
				ipfsGet(hash),
				axios.get(PROPOSAL(spaceKey, hash)),
				axios.get(SPACE(spaceKey)),
			]);

			let [proposal, votes, space]: any = response;

			proposal = formatProposal(proposal);

			const voters = Object.keys(votes.data);
			const block = proposal.msg.payload.snapshot;

			const currentBlock = provider?.getBlockNumber() ?? 0;
			const blockTag = block > currentBlock ? 'latest' : parseInt(block);

			/* Get scores */
			const [scores, profiles]: any = await Promise.all([
				snapshot.utils.getScores(
					spaceKey,
					space.data.strategies,
					space.data.network,
					provider,
					voters,
					// @ts-ignore
					blockTag
				),
				getProfiles([proposal.address, ...voters]),
			]);

			const authorProfile = profiles[proposal.address];

			voters.forEach((address) => {
				votes.data[address].profile = profiles[address];
			});

			proposal.profile = authorProfile;

			votes = Object.fromEntries(
				Object.entries(votes.data)
					.map((vote: any) => {
						vote[1].scores = space.data.strategies.map(
							(_: any, i: number) => scores[i][vote[1].address] || 0
						);
						vote[1].balance = vote[1].scores.reduce((a: any, b: any) => a + b, 0);
						return vote;
					})
					.sort((a, b) => b[1].balance - a[1].balance)
					.filter((vote) => vote[1].balance > 0)
			);

			const returnVoteHistory = () => {
				if (walletAddress && Object.keys(votes).includes(walletAddress)) {
					// @ts-ignore
					const { [[walletAddress]]: firstKeyValue, ...rest } = votes;
					return {
						// @ts-ignore
						[[walletAddress]]: firstKeyValue,
						...rest,
					};
				}
				return votes ?? {};
			};

			let voteArray = Object.values(votes);

			/* Apply dilution penalties for SIP/SCCP pages */

			if (spaceKey === SPACE_KEY.PROPOSAL) {
				const contract = new ethers.Contract(
					CouncilDilution.address,
					CouncilDilution.abi,
					provider as any
				);

				voteArray = await Promise.all(
					voteArray.map(async (vote: any) => {
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

			/* Get results */
			const results = {
				totalVotes: proposal.msg.payload.choices.map(
					(_: any, i: number) =>
						voteArray.filter((vote: any) => vote.msg.payload.choice === i + 1).length
				),
				totalBalances: proposal.msg.payload.choices.map((_: any, i: number) =>
					voteArray
						.filter((vote: any) => vote.msg.payload.choice === i + 1)
						.reduce((a, b: any) => a + b.balance, 0)
				),
				totalScores: proposal.msg.payload.choices.map((_: any, i: number) =>
					space.data.strategies.map((_: any, sI: number) =>
						voteArray
							.filter((vote: any) => vote.msg.payload.choice === i + 1)
							.reduce((a, b: any) => a + b.scores[sI], 0)
					)
				),
				totalVotesBalances: voteArray.reduce((a, b: any) => a + b.balance, 0) as number,
				choices: proposal.msg.payload.choices,
				spaceSymbol: space.data.symbol,
				voteList: Object.values(returnVoteHistory()),
			};

			return results;
		},
		{
			enabled: isAppReady && spaceKey,
			...options,
		}
	);
};

export default useProposal;
