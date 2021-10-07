import onboard from 'bnc-onboard';

import { Subscriptions, WalletType } from 'bnc-onboard/dist/src/interfaces';
import { getInfuraRpcURL } from 'utils/infura';
import { Network, SynthetixJS } from '@synthetixio/contracts-interface';

export const initOnboard = (
	synthetixjs: SynthetixJS,
	networkId: number,
	subscriptions: Subscriptions
) => {
	const network = synthetixjs?.network;
	const infuraRpc = getInfuraRpcURL(network);

	return onboard({
		dappId: process.env.NEXT_PUBLIC_BN_ONBOARD_API_KEY,
		hideBranding: true,
		networkId: networkId,
		subscriptions,
		darkMode: true,
		walletSelect: {
			wallets: [
				{
					name: 'Browser Wallet',
					iconSrc: '/images/browserWallet.svg',
					type: 'injected' as WalletType,
					link: 'https://metamask.io',
					wallet: async (helpers: any) => {
						const { createModernProviderInterface } = helpers;
						const provider = window.ethereum;
						return {
							provider,
							interface: provider ? createModernProviderInterface(provider) : null,
						};
					},
					preferred: true,
					desktop: true,
					mobile: true,
				},
				{
					walletName: 'lattice',
					appName: 'Synthetix',
					rpcUrl: infuraRpc,
				},
				{
					walletName: 'ledger',
					rpcUrl: infuraRpc,
					preferred: true,
				},
				{
					walletName: 'trezor',
					appUrl: 'https://www.synthetix.io',
					email: 'info@synthetix.io',
					rpcUrl: infuraRpc,
					preferred: true,
				},
				{
					walletName: 'walletConnect',
					rpc: { [network ? network.id : Network.Mainnet]: infuraRpc },
					preferred: true,
				},
				{ walletName: 'imToken', rpcUrl: infuraRpc, preferred: true },
				{
					walletName: 'portis',
					apiKey: process.env.NEXT_PUBLIC_PORTIS_APP_ID,
				},
				{ walletName: 'gnosis' },
				{ walletName: 'trust', rpcUrl: infuraRpc },
				{ walletName: 'walletLink', rpcUrl: infuraRpc, preferred: true },
				{ walletName: 'torus' },
				{ walletName: 'status' },
				{ walletName: 'authereum' },
			],
		},
		walletCheck: [
			{ checkName: 'derivationPath' },
			{ checkName: 'accounts' },
			{ checkName: 'connect' },
		],
	});
};
