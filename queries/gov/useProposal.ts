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
import { networkState, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import snapshot from '@snapshot-labs/snapshot.js';

type ProposalResults = {
	totalBalances: number[];
	totalScores: any;
	totalVotes: number[];
	totalVotesBalances: number;
	choices: string[];
	spaceSymbol: string;
	voteList: any[];
};

const useProposal = (
	spaceKey: SPACE_KEY,
	hash: string,
	testnet?: boolean,
	options?: QueryConfig<ProposalResults>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { provider } = Connector.useContainer();

	return useQuery<ProposalResults>(
		QUERY_KEYS.Gov.Proposal,
		async () => {
			const response = await Promise.all([
				ipfsGet(hash),
				axios.get(PROPOSAL(spaceKey, hash, testnet)),
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
				return votes.data ?? {};
			};

			/* Get results */
			const results = {
				totalVotes: proposal.msg.payload.choices.map(
					(_: any, i: number) =>
						Object.values(votes).filter((vote: any) => vote.msg.payload.choice === i + 1).length
				),
				totalBalances: proposal.msg.payload.choices.map((_: any, i: number) =>
					Object.values(votes)
						.filter((vote: any) => vote.msg.payload.choice === i + 1)
						.reduce((a, b: any) => a + b.balance, 0)
				),
				totalScores: proposal.msg.payload.choices.map((_: any, i: number) =>
					space.data.strategies.map((_: any, sI: number) =>
						Object.values(votes)
							.filter((vote: any) => vote.msg.payload.choice === i + 1)
							.reduce((a, b: any) => a + b.scores[sI], 0)
					)
				),
				totalVotesBalances: Object.values(votes).reduce((a, b: any) => a + b.balance, 0) as number,
				choices: proposal.msg.payload.choices,
				spaceSymbol: space.data.symbol,
				voteList: Object.values(returnVoteHistory()),
			};

			return results;
		},
		{
			enabled: isAppReady && spaceKey && hash,
			...options,
		}
	);
};

export default useProposal;
