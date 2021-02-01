import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import axios from 'axios';

import QUERY_KEYS from 'constants/queryKeys';
import { PROPOSAL_INDIVIDUAL_PROPOSAL, PROPOSAL_PROPOSALS } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { Proposal, SPACES } from './types';
import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import snapshot from '@snapshot-labs/snapshot.js';

import PROPOSALS from 'constants/snapshot/spaces/proposals.json';
import Connector from 'containers/Connector';

const useGovernanceProposals = (options?: QueryConfig<Proposal[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { provider } = Connector.useContainer();

	return useQuery<Proposal[]>(
		QUERY_KEYS.Gov.GovProposals(walletAddress ?? '', network?.id!),
		async () => {
			let proposalsResponse = await axios.get(PROPOSAL_PROPOSALS);

			const { data } = proposalsResponse;

			let result = [];

			for (var key in data) {
				const proposal = data[key] as Proposal;
				const proposalSnapshot = proposal.msg.payload.snapshot;
				const hash = key;
				let voterResponse = await axios.get(PROPOSAL_INDIVIDUAL_PROPOSAL(hash));

				const blockNumber: any = await provider?.getBlockNumber();

				const blockTag =
					parseInt(proposalSnapshot) > parseInt(blockNumber)
						? 'latest'
						: parseInt(proposalSnapshot);

				const [scores] = await Promise.all([
					snapshot.utils.getScores(
						PROPOSALS.key,
						PROPOSALS.strategies,
						PROPOSALS.network,
						provider,
						Object.values(voterResponse.data).map((vote: any) => vote.address),
						// // @ts-ignore
						blockTag
					),
				]);

				result.push({
					...data[key],
					votes: Object.values(scores[0]).filter((e: any) => e > 0).length,
				});
			}
			return result;
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useGovernanceProposals;
