import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import axios from 'axios';
import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import {
	COUNCIL_INDIVIDUAL_PROPOSAL,
	COUNCIL_PROPOSALS,
	PROPOSAL_INDIVIDUAL_PROPOSAL,
	PROPOSAL_PROPOSALS,
	quadraticWeighting,
} from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { Proposal, SPACES, Vote } from './types';
import { toBigNumber } from 'utils/formatters/number';
import { uniqBy } from 'lodash';
import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { getScores, getProvider } from '@snapshot-labs/snapshot.js';

import COUNCIL from 'constants/snapshot/spaces/council.json';

const useProposals = (spaceKey: SPACES, options?: QueryConfig<Proposal[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<Proposal[]>(
		QUERY_KEYS.Gov.Proposals(spaceKey, walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { SynthetixState },
				utils: { formatUnits },
			} = synthetix.js!;

			let proposalResponse;
			if (spaceKey === SPACES.COUNCIL) {
				proposalResponse = await axios.get(COUNCIL_PROPOSALS);
			} else {
				proposalResponse = await axios.get(PROPOSAL_PROPOSALS);
			}

			const { data } = proposalResponse;

			let proposals: any;

			const scores: any = await getScores(
				COUNCIL.key,
				COUNCIL.strategies,
				COUNCIL.network,
				getProvider(COUNCIL.network),
				['0xBD015d82a36C9a05108ebC5FEE12672F24dA0Cf4']
			);

			console.log('Scores', scores);

			// proposals = Object.fromEntries(
			// 	Object.entries(data).map((proposal: any) => {
			// 		proposal[1].score = scores.reduce((a, b) => a + (b[proposal[1].address] || 0), 0);
			// 		return [proposal[0], proposal[1]];
			// 	})
			// );

			// let result = [];

			// for (var key in data) {
			// 	const rest = data[key];

			// 	const block = data[key].msg.payload.snapshot;

			// 	let voteResponse;
			// 	if (spaceKey === SPACES.COUNCIL) {
			// 		voteResponse = await axios.get(COUNCIL_INDIVIDUAL_PROPOSAL(key));
			// 	} else {
			// 		voteResponse = await axios.get(PROPOSAL_INDIVIDUAL_PROPOSAL(key));
			// 	}

			// 	let voters = [];

			// 	for (var key in voteResponse.data) {
			// 		const voterRest = voteResponse.data[key];

			// 		let issuanceData = await SynthetixState.issuanceData(key, {
			// 			blockTag: block ? parseInt(block) : 'latest',
			// 		});

			// 		const debtOwnership = toBigNumber(
			// 			formatUnits(issuanceData.initialDebtOwnership.toString(), 27)
			// 		);

			// 		voters.push({
			// 			address: key,
			// 			voterWeight: Number(quadraticWeighting(debtOwnership)),
			// 			// voterWeight: 12,
			// 			...voterRest,
			// 		});
			// 	}

			// 	const ResolvedVoters = await Promise.resolve(Promise.all(voters));

			// 	const uniqVoters = uniqBy(ResolvedVoters, (e) => e.address);

			// 	const filteredVoters = uniqVoters.filter((e) => e.voterWeight > 0);

			// 	result.push({
			// 		proposalHash: key,
			// 		filteredVoters: filteredVoters,
			// 		...rest,
			// 	});
			// }

			console.table(proposals);

			return proposals;
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useProposals;
