import onboard from 'bnc-onboard';
import { OPTIMISM_NETWORKS } from '@synthetixio/optimism-networks';

import { Subscriptions } from 'bnc-onboard/dist/src/interfaces';
import { getInfuraRpcURL } from 'utils/infura';

import { Network } from 'store/wallet';

export const initOnboard = (network: Network, subscriptions: Subscriptions) => {
	const isL2 = network?.useOvm ?? false;
	const rpcUrl = isL2 ? OPTIMISM_NETWORKS[network.id].rpcUrls[0] : getInfuraRpcURL(network);

	return onboard({
		dappId: process.env.NEXT_PUBLIC_BN_ONBOARD_API_KEY,
		hideBranding: true,
		networkId: network.id,
		subscriptions,
		darkMode: true,
		walletSelect: {
			wallets: [
				{
					name: 'Browser Wallet',
					iconSrc: '/images/browser-wallet.png',
					wallet: async (helpers) => {
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
					walletName: 'ledger',
					rpcUrl: rpcUrl,
					preferred: true,
				},
				{
					walletName: 'trezor',
					appUrl: 'https://www.synthetix.io',
					email: 'info@synthetix.io',
					rpcUrl: rpcUrl,
					preferred: true,
				},
				{
					walletName: 'walletConnect',
					rpc: { [network.id]: rpcUrl },
					preferred: true,
				},
				{ walletName: 'walletLink', rpcUrl: rpcUrl, preferred: true },
				{
					walletName: 'portis',
					apiKey: process.env.NEXT_PUBLIC_PORTIS_APP_ID,
				},
				{
					walletName: 'lattice',
					appName: 'Synthetix',
					rpcUrl: rpcUrl,
				},
				{ walletName: 'trust', rpcUrl: rpcUrl },
				{ walletName: 'torus' },
				{ walletName: 'status' },
				{ walletName: 'authereum' },
			],
		},
		walletCheck: [
			{ checkName: 'derivationPath' },
			{ checkName: 'accounts' },
			{ checkName: 'connect' },
			{ checkName: 'network' },
		],
	});
};
