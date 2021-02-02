import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import axios from 'axios';

import QUERY_KEYS from 'constants/queryKeys';
import { SPACE, PROPOSAL, SPACE_KEY, PROPOSALS } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { Proposal, SpaceData } from './types';
import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import snapshot from '@snapshot-labs/snapshot.js';
import Connector from 'containers/Connector';

const useProposals = (spaceKey: SPACE_KEY, options?: QueryConfig<Proposal[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { provider } = Connector.useContainer();

	return useQuery<Proposal[]>(
		QUERY_KEYS.Gov.Proposals(spaceKey, walletAddress ?? '', network?.id!),
		async () => {
			const space = await axios.get(SPACE(spaceKey));

			const spaceData = space.data as SpaceData;

			const proposalsResponse = await axios.get(PROPOSALS(spaceKey));

			const { data } = proposalsResponse;

			let result = [];

			for (var key in data) {
				const proposal = data[key] as Proposal;
				const proposalSnapshot = proposal.msg.payload.snapshot;
				const hash = key;
				let voterResponse = await axios.get(PROPOSAL(spaceKey, hash));

				const blockNumber: any = await provider?.getBlockNumber();

				const blockTag =
					parseInt(proposalSnapshot) > parseInt(blockNumber)
						? 'latest'
						: parseInt(proposalSnapshot);

				const [scores]: any = await Promise.all([
					snapshot.utils.getScores(
						spaceKey,
						spaceData.strategies,
						spaceData.network,
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
			return result;
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useProposals;
