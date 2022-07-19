import { SynthetixJS } from '@synthetixio/contracts-interface';
import { OnboardAPI } from '@web3-onboard/core';
import { ethers } from 'ethers';
import { Network } from 'store/wallet';
import { onboard } from './config';

type ConnectorState = {
	network: Network | null;
	provider: ethers.providers.Web3Provider | null;
	signer: ethers.Signer | null;
	synthetixjs: SynthetixJS | null;
	isAppReady: boolean;
	walletAddress: string | null;
	walletWatched: string | null;
	ensName: string | null;
	ensAvatar: string | null;
	onboard: OnboardAPI | null;
};

export const initialState: ConnectorState = {
	network: null,
	provider: null,
	signer: null,
	synthetixjs: null,
	isAppReady: false,
	walletAddress: null,
	walletWatched: null,
	ensName: null,
	ensAvatar: null,
	onboard: onboard,
};

export type ConnectionUpdate = {
	address: string;
	network: Network;
	signer: ethers.Signer | null;
	walletWatched: null;
	synthetixjs: SynthetixJS;
	provider: ethers.providers.Web3Provider;
	ensName: string | null;
	ensAvatar: string | null;
};

export type EnsUpdate = {
	ensName: string | null;
	ensAvatar: string | null;
};

export type WatchWallet = {
	ensName: string | null;
	address: string | null;
	walletWatched: string | null;
};

export type ProviderUpdate = {
	provider: ethers.providers.Web3Provider;
	network: Network;
};

export type Actions =
	| { type: 'app_ready'; payload: OnboardAPI }
	| { type: 'config_update'; payload: ConnectionUpdate }
	| { type: 'watch_wallet'; payload: WatchWallet }
	| { type: 'set_ens'; payload: EnsUpdate }
	| { type: 'update_provider'; payload: ProviderUpdate }
	| { type: 'wallet_disconnected' };

export function reducer(state: ConnectorState, action: Actions) {
	switch (action.type) {
		case 'app_ready':
			return { ...state, isAppReady: true, onboard: action.payload };

		case 'config_update':
			return {
				...state,
				walletWatched: action.payload.walletWatched,
				walletAddress: action.payload.address,
				network: action.payload.network,
				signer: action.payload.signer,
				provider: action.payload.provider,
				synthetixjs: action.payload.synthetixjs,
				ensName: action.payload.ensName,
				ensAvatar: action.payload.ensAvatar,
			};

		case 'watch_wallet':
			return {
				...state,
				walletAddress: action.payload.address,
				ensName: action.payload.ensName,
				walletWatched: action.payload.walletWatched,
			};

		case 'set_ens':
			return { ...state, ensName: action.payload.ensName, ensAvatar: action.payload.ensAvatar };

		case 'wallet_disconnected':
			return {
				...state,
				network: null,
				provider: null,
				signer: null,
				synthetixjs: null,
				walletAddress: null,
				watchedWallet: null,
				ensName: null,
				ensAvatar: null,
			};

		case 'update_provider':
			return {
				...state,
				provider: action.payload.provider,
				network: action.payload.network,
			};

		default:
			return { ...state };
	}
}
