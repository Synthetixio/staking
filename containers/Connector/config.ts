import onboard from '@gnosis.pm/safe-apps-onboard';

import synthetix from 'lib/synthetix';
import { NetworkId } from '@synthetixio/contracts-interface';

import { Subscriptions } from 'bnc-onboard/dist/src/interfaces';
import { getInfuraRpcURL } from 'utils/infura';

import { Network } from 'store/wallet';

export function isSupportedNetwork() {
	return async (stateAndHelpers: any) => {
		const { network } = stateAndHelpers;

		const isSupportedNetwork =
			synthetix.chainIdToNetwork != null && synthetix.chainIdToNetwork[network as NetworkId]
				? true
				: false;

		if (!isSupportedNetwork) {
			return {
				heading: `You Must Change Networks`,
				description: `We've detected that you need to switch your wallet's network from UNKNOWN to a supported network. Please check SynthetixJS.supportedNetworks for a list of supported networks and ids.`,
				eventCode: 'network',
				icon: `
				<svg height="18" viewBox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg">
					<path d="m13.375 28c-1.86075 0-3.375-1.51425-3.375-3.375s1.51425-3.375 3.375-3.375 3.375 1.51425 3.375 3.375-1.51425 3.375-3.375 3.375zm0-4.5c-.619875 0-1.125.504-1.125 1.125s.505125 1.125 1.125 1.125 1.125-.504 1.125-1.125-.505125-1.125-1.125-1.125zm0-6.75c-1.86075 0-3.375-1.51425-3.375-3.375s1.51425-3.375 3.375-3.375 3.375 1.51425 3.375 3.375-1.51425 3.375-3.375 3.375zm0-4.5c-.619875 0-1.125.505125-1.125 1.125s.505125 1.125 1.125 1.125 1.125-.505125 1.125-1.125-.505125-1.125-1.125-1.125zm11.25 4.5c-1.86075 0-3.375-1.51425-3.375-3.375s1.51425-3.375 3.375-3.375 3.375 1.51425 3.375 3.375-1.51425 3.375-3.375 3.375zm0-4.5c-.621 0-1.125.505125-1.125 1.125s.504 1.125 1.125 1.125 1.125-.505125 1.125-1.125-.504-1.125-1.125-1.125zm-11.25 10.117125h-.014625c-.615375-.007875-1.110375-.50175-1.110375-1.117125 0-1.35675.898875-3.375 3.375-3.375h6.75c.50625-.0135 1.125-.219375 1.125-1.125v-1.125c0-.621.502875-1.125 1.125-1.125s1.125.504 1.125 1.125v1.125c0 2.476125-2.01825 3.375-3.375 3.375h-6.75c-.905625 0-1.1115.61875-1.125 1.1385-.01575.610875-.51525 1.103625-1.125 1.103625zm0 1.132875c-.621 0-1.125-.502875-1.125-1.125v-6.75c0-.621.504-1.125 1.125-1.125s1.125.504 1.125 1.125v6.75c0 .622125-.504 1.125-1.125 1.125z" fill="currentColor" transform="translate(-10 -10)"></path>
				</svg>
        `,
			};
		}
	};
}

export const initOnboard = (network: Network, subscriptions: Subscriptions) => {
	const infuraRpc = getInfuraRpcURL(network);

	const defaultWalletChecks = [
		{ checkName: 'derivationPath' },
		{ checkName: 'accounts' },
		{ checkName: 'connect' },
	];

	const supportedNetworkCheck = isSupportedNetwork();

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
					iconSrc: '/images/browserWallet.svg',
					type: 'injected',
					link: 'https://metamask.io',
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
					rpc: { [network.id]: infuraRpc },
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
		walletCheck: [...defaultWalletChecks, supportedNetworkCheck],
	});
};
