import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import axios from 'axios';

import QUERY_KEYS from 'constants/queryKeys';
import { ipfsGet, PROPOSAL, SPACE, SPACE_KEY } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { Proposal, SpaceData, Vote } from './types';
import { networkState, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import snapshot from '@snapshot-labs/snapshot.js';

const useProposal = (
	spaceKey: SPACE_KEY,
	hash: string,
	testnet?: boolean,
	options?: QueryConfig<Vote[]>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { provider } = Connector.useContainer();

	return useQuery<any>(
		QUERY_KEYS.Gov.Proposal(spaceKey, hash, walletAddress ?? '', network?.id!, testnet),
		async () => {
			const response = await Promise.all([
				ipfsGet(hash),
				axios.get(PROPOSAL(spaceKey, hash, testnet)),
			]);

			console.log(response);
			let [proposal, { data }]: any = response;

			console.log(proposal);

			proposal = snapshot.helpers.formatProposal(proposal);
			// proposal.ipfsHash = id;
			// const voters = Object.keys(votes);
			// const { snapshot } = proposal.msg.payload;
			// const blockTag = snapshot > blockNumber ? 'latest' : parseInt(snapshot);

			// /* Get scores */
			// console.time('getProposal.scores');
			// const [scores, profiles]: any = await Promise.all([
			// 	getScores(
			// 		space.key,
			// 		space.strategies,
			// 		space.network,
			// 		provider,
			// 		voters,
			// 		// @ts-ignore
			// 		blockTag
			// 	),
			// 	getProfiles([proposal.address, ...voters]),
			// ]);
			// console.timeEnd('getProposal.scores');
			// console.log('Scores', scores);

			// const authorProfile = profiles[proposal.address];
			// voters.forEach((address) => {
			// 	votes[address].profile = profiles[address];
			// });
			// proposal.profile = authorProfile;

			// votes = Object.fromEntries(
			// 	Object.entries(votes)
			// 		.map((vote: any) => {
			// 			vote[1].scores = space.strategies.map((strategy, i) => scores[i][vote[1].address] || 0);
			// 			vote[1].balance = vote[1].scores.reduce((a, b: any) => a + b, 0);
			// 			return vote;
			// 		})
			// 		.sort((a, b) => b[1].balance - a[1].balance)
			// 		.filter((vote) => vote[1].balance > 0)
			// );

			// /* Get results */
			// const results = {
			// 	totalVotes: proposal.msg.payload.choices.map(
			// 		(choice, i) =>
			// 			Object.values(votes).filter((vote: any) => vote.msg.payload.choice === i + 1).length
			// 	),
			// 	totalBalances: proposal.msg.payload.choices.map((choice, i) =>
			// 		Object.values(votes)
			// 			.filter((vote: any) => vote.msg.payload.choice === i + 1)
			// 			.reduce((a, b: any) => a + b.balance, 0)
			// 	),
			// 	totalScores: proposal.msg.payload.choices.map((choice, i) =>
			// 		space.strategies.map((strategy, sI) =>
			// 			Object.values(votes)
			// 				.filter((vote: any) => vote.msg.payload.choice === i + 1)
			// 				.reduce((a, b: any) => a + b.scores[sI], 0)
			// 		)
			// 	),
			// 	totalVotesBalances: Object.values(votes).reduce((a, b: any) => a + b.balance, 0),
			// };
		},
		{
			enabled: isAppReady && spaceKey && hash,
			...options,
		}
	);
};

export default useProposal;
