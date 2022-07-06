import { SynthetixJS } from '@synthetixio/contracts-interface';
import { TransactionNotifierInterface } from '@synthetixio/transaction-notifier';
import { ethers } from 'ethers';
import { Network } from 'store/wallet';

type ConnectorState = {
	network: Network | null;
	provider: ethers.providers.Provider | null;
	signer: ethers.Signer | null;
	synthetixjs: SynthetixJS | null;
	isAppReady: boolean;
	walletAddress: string | null;
	selectedWallet: string | null;
	transactionNotifier: TransactionNotifierInterface | null;
};

export const initialState: ConnectorState = {
	network: null,
	provider: null,
	signer: null,
	synthetixjs: null,
	isAppReady: false,
	walletAddress: null,
	selectedWallet: null,
	transactionNotifier: null,
};

export type Actions =
	| { type: 'app_ready' }
	| { type: 'connect_network' }
	| { type: 'switch_network' };

export function reducer(state: ConnectorState, action: Actions) {
	switch (action.type) {
		case 'app_ready':
			return { ...state, isAppReady: true };
		default:
			return { ...state };
	}
}
