import { useRecoilValue } from 'recoil';
import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
import axios, { AxiosResponse } from 'axios';

import { MESSAGE_URL, snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';
import { walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import { ethers } from 'ethers';

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
		plugins: any;
		network: string;
		strategies: {
			name: string;
			params: {
				symbol: string;
				address: string;
				decimals: string;
			};
		}[];
	};
	type: string;
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

const useSignMessage = (
	options: UseMutationOptions<AxiosResponse<any>, any, SignaturePayload, unknown> = {}
) => {
	const { signer } = Connector.useContainer();
	const walletAddress = useRecoilValue(walletAddressState);

	const qc = useQueryClient();

	return useMutation<AxiosResponse<any>, any, SignaturePayload, unknown>(
		async (payload: SignaturePayload) => {
			const version = '0.1.3';
			let msg: any = {
				address: walletAddress ? ethers.utils.getAddress(walletAddress) : '',
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
				qc.invalidateQueries(['gov', 'proposal', snapshotEndpoint]);
			},
			onError: (e: any) => {
				return e;
			},

			...options,
		}
	);
};

export default useSignMessage;
