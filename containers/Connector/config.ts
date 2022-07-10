import { Subscriptions, WalletType } from 'bnc-onboard/dist/src/interfaces';
import { getInfuraRpcURL } from 'utils/infura';
import { NetworkId, NetworkIdByName } from '@synthetixio/contracts-interface';

import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';

const injected = injectedModule();

export const onboard = Onboard({
	apiKey: process.env.NEXT_PUBLIC_BN_ONBOARD_API_KEY,
	wallets: [injected],
	chains: [
		{
			id: '0x1',
			token: 'ETH',
			label: 'Ethereum Mainnet',
			rpcUrl: getInfuraRpcURL(1),
		},
	],
});

// export const initOnboard = (networkId: NetworkId, subscriptions: Subscriptions) => {
// 	const infuraRpc = getInfuraRpcURL(networkId);

// 	return onboard({
// 		dappId: process.env.NEXT_PUBLIC_BN_ONBOARD_API_KEY,
// 		hideBranding: true,
// 		networkId: Number(networkId),
// 		subscriptions,
// 		darkMode: true,
// 		walletSelect: {
// 			wallets: [
// 				{
// 					name: 'Browser Wallet',
// 					iconSrc: '/images/browserWallet.svg',
// 					type: 'injected' as WalletType,
// 					link: 'https://metamask.io',
// 					wallet: async (helpers) => {
// 						const { createModernProviderInterface } = helpers;
// 						const provider = window.ethereum;
// 						return {
// 							provider,
// 							interface: provider ? createModernProviderInterface(provider) : null,
// 						};
// 					},
// 					preferred: true,
// 					desktop: true,
// 					mobile: true,
// 				},
// 				{
// 					walletName: 'lattice',
// 					appName: 'Synthetix',
// 					rpcUrl: infuraRpc,
// 				},
// 				{
// 					walletName: 'ledger',
// 					rpcUrl: infuraRpc,
// 					preferred: true,
// 				},
// 				{
// 					walletName: 'trezor',
// 					appUrl: 'https://www.synthetix.io',
// 					email: 'info@synthetix.io',
// 					rpcUrl: infuraRpc,
// 					preferred: true,
// 				},
// 				{
// 					walletName: 'walletConnect',
// 					rpc: {
// 						[NetworkIdByName.mainnet]: getInfuraRpcURL(NetworkIdByName.mainnet),
// 						[NetworkIdByName['mainnet-ovm']]: getInfuraRpcURL(NetworkIdByName['mainnet-ovm']),
// 						[NetworkIdByName['kovan']]: getInfuraRpcURL(NetworkIdByName['kovan']),
// 						[NetworkIdByName['kovan-ovm']]: getInfuraRpcURL(NetworkIdByName['kovan-ovm']),
// 					},
// 					preferred: true,
// 				},
// 				{ walletName: 'imToken', rpcUrl: infuraRpc, preferred: true },
// 				{
// 					walletName: 'portis',
// 					apiKey: process.env.NEXT_PUBLIC_PORTIS_APP_ID,
// 				},
// 				{ walletName: 'gnosis' },
// 				{ walletName: 'trust', rpcUrl: infuraRpc },
// 				{ walletName: 'walletLink', rpcUrl: infuraRpc, preferred: true },
// 				{ walletName: 'torus' },
// 				{ walletName: 'status' },
// 				{ walletName: 'authereum' },
// 				{ walletName: 'tally', preferred: true },
// 			],
// 		},
// 		walletCheck: [
// 			{ checkName: 'derivationPath' },
// 			{ checkName: 'accounts' },
// 			{ checkName: 'connect' },
// 		],
// 	});
// };
