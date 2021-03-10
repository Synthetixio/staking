import { useRecoilValue } from 'recoil';
import { useMutation, useQueryCache } from 'react-query';
// import { version } from '@snapshot-labs/snapshot.js/package.json';
import axios from 'axios';

import { MESSAGE_URL, SPACE_KEY } from 'constants/snapshot';
import { walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import QUERY_KEYS from 'constants/queryKeys';

type VotePayload = {
	proposal: string;
	choice: number;
	metadata: Object;
};

type ProposalPayload = {
	name: string;
	body: string;
	choices: string[];
	start: number;
	end: number;
	snapshot: number;
	metadata: {
		strategies: {
			name: string;
			params: {
				symbol: string;
				address: string;
				decimals: string;
			};
		}[];
	};
};

export enum SignatureType {
	VOTE = 'vote',
	PROPOSAL = 'proposal',
}

type SignaturePayload = {
	spaceKey: SPACE_KEY;
	type: SignatureType;
	payload: VotePayload | ProposalPayload;
};

const useSignMessage = () => {
	const { signer } = Connector.useContainer();
	const walletAddress = useRecoilValue(walletAddressState);
	const queryCache = useQueryCache();

	return useMutation(
		async (payload: SignaturePayload) => {
			const version = '0.1.3';
			let msg: any = {
				address: walletAddress?.toLowerCase(),
				msg: JSON.stringify({
					version,
					timestamp: (Date.now() / 1e3).toFixed(),
					space: payload.spaceKey,
					type: payload.type,
					payload: payload.payload,
				}),
			};

			msg.sig = await signer?.signMessage(msg.msg);

			return axios.post(MESSAGE_URL, msg, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
		},
		{
			onSuccess: () => {
				queryCache.invalidateQueries(QUERY_KEYS.Gov.Proposal);
			},
			onError: (e: any) => {
				return e;
			},
		}
	);
};

export default useSignMessage;
