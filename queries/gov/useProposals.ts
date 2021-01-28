import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import axios from 'axios';

import QUERY_KEYS from 'constants/queryKeys';
import {
	COUNCIL_INDIVIDUAL_PROPOSAL,
	COUNCIL_PROPOSALS,
	PROPOSAL_INDIVIDUAL_PROPOSAL,
	PROPOSAL_PROPOSALS,
} from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { Proposal, SPACES } from './types';
import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import snapshot from '@snapshot-labs/snapshot.js';

import COUNCIL from 'constants/snapshot/spaces/council.json';
import Connector from 'containers/Connector';

const useProposals = (spaceKey: SPACES, options?: QueryConfig<Proposal[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { provider } = Connector.useContainer();

	return useQuery<Proposal[]>(
		QUERY_KEYS.Gov.Proposals(spaceKey, walletAddress ?? '', network?.id!),
		async () => {
			let proposalsResponse;
			if (spaceKey === SPACES.COUNCIL) {
				proposalsResponse = await axios.get(COUNCIL_PROPOSALS);
			} else {
				proposalsResponse = await axios.get(PROPOSAL_PROPOSALS);
			}

			const { data } = proposalsResponse;

			let result = [];

			for (var key in data) {
				const proposal = data[key] as Proposal;
				const blockTag = parseInt(proposal.msg.payload.snapshot);
				const hash = key;
				let voterResponse;
				if (spaceKey === SPACES.COUNCIL) {
					voterResponse = await axios.get(COUNCIL_INDIVIDUAL_PROPOSAL(hash));
				} else {
					voterResponse = await axios.get(PROPOSAL_INDIVIDUAL_PROPOSAL(hash));
				}
				const [scores]: any = await Promise.all([
					snapshot.utils.getScores(
						COUNCIL.key,
						COUNCIL.strategies,
						COUNCIL.network,
						provider,
						Object.values(voterResponse.data).map((vote: any) => vote.address),
						// @ts-ignore
						blockTag
					),
				]);
				result.push({
					...data[key],
					votes: Object.values(scores[0]).filter((e: any) => e > 0).length,
				});
			}
			console.log(result);

			return result;
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useProposals;
