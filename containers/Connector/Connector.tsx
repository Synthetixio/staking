import { useState, useEffect, useMemo, useReducer } from 'react';
import { createContainer } from 'unstated-next';
import { TransactionNotifierInterface } from '@synthetixio/transaction-notifier';
import { loadProvider } from '@synthetixio/providers';

import { getDefaultNetworkId, getIsOVM, isSupportedNetworkId } from 'utils/network';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
	SynthetixJS,
	synthetix,
	NetworkNameById,
	NetworkIdByName,
} from '@synthetixio/contracts-interface';
import { ethers, providers } from 'ethers';
import { switchToL1 } from '@synthetixio/optimism-networks';

import {
	walletAddressState,
	networkState,
	ensNameState,
	walletWatchedState,
	ensAvatarState,
} from 'store/wallet';

import useLocalStorage from 'hooks/useLocalStorage';

import { onboard } from './config';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { CurrencyKey, ETH_ADDRESS } from 'constants/currency';
import { synthToContractName } from 'utils/currencies';
import { keyBy } from 'lodash';
import { initialState, reducer } from './reducer';

const useConnector = () => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const { isAppReady } = state;
	const [network, setNetwork] = useRecoilState(networkState);
	const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);

	// Ethereum Mainnet
	const L1DefaultProvider: providers.InfuraProvider = useMemo(
		() =>
			loadProvider({
				infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
					? process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
					: '0',
				networkId: NetworkIdByName.mainnet,
			}),
		[]
	);

	// Optimism Mainnet
	const L2DefaultProvider: providers.InfuraProvider = useMemo(
		() =>
			loadProvider({
				infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
					? process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
					: '0',
				networkId: NetworkIdByName['mainnet-ovm'],
			}),
		[]
	);

	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [synthetixjs, setSynthetixjs] = useState<SynthetixJS | null>(null);
	// const [onboard, setOnboard] = useState<ReturnType<typeof initOnboard> | null>(null);
	const [walletAddress, setWalletAddress] = useRecoilState(walletAddressState);

	const [selectedWallet, setSelectedWallet] = useLocalStorage<string | null>(
		LOCAL_STORAGE_KEYS.SELECTED_WALLET,
		''
	);

	const [transactionNotifier, setTransactionNotifier] =
		useState<TransactionNotifierInterface | null>(null);
	const setEnsName = useSetRecoilState(ensNameState);
	const setEnsAvatar = useSetRecoilState(ensAvatarState);
	const watchedWallet = useRecoilValue(walletWatchedState);

	const [synthsMap, tokensMap] = useMemo(() => {
		if (synthetixjs == null) {
			return [{}, {}];
		}

		return [keyBy(synthetixjs.synths, 'name'), keyBy(synthetixjs.tokens, 'symbol')];
	}, [synthetixjs]);

	console.log(synthsMap, tokensMap);

	useEffect(() => {
		// Default case, occurs when no injected wallet and no 'browser wallet in localStorage'
		const init: () => void = async () => {
			if (!window.ethereum || selectedWallet !== 'Browser Wallet') {
				dispatch({ type: 'app_ready' });

				// For non browser wallets we use mainnet by default. And the app/wallet will trigger wallet change events if needed
				setNetwork({
					name: NetworkNameById[NetworkIdByName.mainnet],
					id: NetworkIdByName.mainnet,
					useOvm: false,
				});

				setProvider(L1DefaultProvider);
				setSynthetixjs(
					synthetix({
						networkId: NetworkIdByName.mainnet,
						useOvm: false,
						provider: L1DefaultProvider,
					})
				);
				return;
			}

			const networkId = await getDefaultNetworkId();
			console.log('network id', networkId);
			if (!isSupportedNetworkId(networkId)) {
				// When not on supported network: Switch to l1 and try again
				await switchToL1({ ethereum: window.ethereum });
				return init();
			}

			// Synchronous
			const provider = loadProvider({
				networkId,
				infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
				provider: window.ethereum as any, // loadProvider as incorrect types for provider
			});

			// Synchronous
			const useOvm = getIsOVM(Number(networkId));

			// Synchronous
			const snxjs = synthetix({ provider, networkId, useOvm });

			setNetwork(snxjs.network);
			setSynthetixjs(snxjs);
			setProvider(provider);
			dispatch({ type: 'app_ready' });
		};

		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const setUserAddress = async (address: string) => {
		console.log('Running set user address');
		setWalletAddress(address);
		if (address) {
			const ensName: string | null = await L1DefaultProvider.lookupAddress(address);
			let avatar = ensName ? await L1DefaultProvider.getAvatar(ensName) : null;
			setEnsName(ensName);
			setEnsAvatar(avatar);
		}
	};

	useEffect(() => {
		if (isAppReady && network) {
			// const onboard = initOnboard(network.id, {
			// 	address: setUserAddress,
			// 	network: (networkId) => {
			// 		if (!networkId) return; // user disconnected the wallet
			// 		if (!isSupportedNetworkId(networkId)) {
			// 			// This should only happen when a user is connected and changes to an unsupported network
			// 			if (window.ethereum) {
			// 				switchToL1({ ethereum: window.ethereum });
			// 			}
			// 			// We can return here since the network change will trigger this callback again
			// 			return;
			// 		}
			// 		const provider = loadProvider({
			// 			provider: onboard.getState().wallet.provider,
			// 		});
			// 		const signer = provider.getSigner();
			// 		const useOvm = getIsOVM(networkId);
			// 		const snxjs = synthetix({ provider, networkId: networkId as NetworkId, signer, useOvm });
			// 		onboard.config({ networkId });
			// 		if (transactionNotifier) {
			// 			transactionNotifier.setProvider(provider);
			// 		} else {
			// 			setTransactionNotifier(new TransactionNotifier(provider));
			// 		}
			// 		setProvider(provider);
			// 		setSynthetixjs(snxjs);
			// 		setSigner(signer);
			// 		setNetwork(snxjs.network);
			// 	},
			// 	wallet: async (wallet: OnboardWallet) => {
			// 		console.log('No wallet provider');
			// 		if (wallet.provider) {
			// 			console.log('Wallet.provider');
			// 			const provider = loadProvider({ provider: wallet.provider });
			// 			const network = await provider.getNetwork();
			// 			const networkId = Number(network.chainId);
			// 			if (!isSupportedNetworkId(networkId)) {
			// 				if (window.ethereum) {
			// 					await switchToL1({ ethereum: window.ethereum });
			// 				}
			// 				// We return here and expect the network change to trigger onboard's network callback
			// 				return;
			// 			}
			// 			const useOvm = getIsOVM(Number(networkId));
			// 			const snxjs = synthetix({ provider, networkId, signer: provider.getSigner(), useOvm });
			// 			setProvider(provider);
			// 			setSigner(provider.getSigner());
			// 			setSynthetixjs(snxjs);
			// 			setNetwork(snxjs.network);
			// 			setSelectedWallet(wallet.name);
			// 			setTransactionNotifier(new TransactionNotifier(provider));
			// 		} else {
			// 			// TODO: setting provider to null might cause issues, perhaps use a default provider?
			// 			// setProvider(null);
			// 			setSigner(null);
			// 			setWalletAddress(null);
			// 			setSelectedWallet(null);
			// 		}
			// 	},
			// });
			// setOnboard(onboard);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAppReady]);

	// load previously saved wallet
	// useEffect(() => {
	// 	if (onboard && selectedWallet && !walletAddress) {
	// 		onboard.walletSelect(selectedWallet);
	// 	}
	// }, [onboard, selectedWallet, walletAddress]);

	useEffect(() => {
		if (watchedWallet) {
			const provider = loadProvider({ infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID });
			if (provider) {
				setProvider(provider);
			}
		}
	}, [watchedWallet]);

	const connectWallet = async () => {
		try {
			const wallets = await onboard.connectWallet();
			console.log(wallets);
		} catch (error) {
			console.log('Error');
		}
	};

	const disconnectWallet = async () => {
		try {
			const [primaryWallet] = onboard.state.get().wallets;
			onboard.disconnectWallet({ label: primaryWallet.label });
		} catch (e) {
			console.log(e);
		}
	};

	const switchAccounts = async () => {
		try {
			await onboard.setChain({ chainId: '0x89' });
		} catch (e) {
			console.log(e);
		}
	};

	const isHardwareWallet = () => {
		if (onboard) {
			const onboardState = onboard.state.get().walletModules;
			console.log(onboardState);
			// if (onboardState.address != null) {
			// 	return onboardState.wallet.type === 'hardware';
			// }
		}
		return false;
	};

	const getTokenAddress = (currencyKey: CurrencyKey) => {
		if (synthetixjs == null) {
			return null;
		}

		return currencyKey === 'ETH'
			? ETH_ADDRESS
			: synthetixjs!.contracts[synthToContractName(currencyKey!)].address;
	};

	return {
		isAppReady,
		network,
		provider,
		signer,
		synthetixjs,
		synthsMap,
		tokensMap,
		connectWallet,
		disconnectWallet,
		switchAccounts,
		isHardwareWallet,
		transactionNotifier,
		selectedWallet,
		getTokenAddress,
		L1DefaultProvider,
		L2DefaultProvider,
	};
};

const Connector = createContainer(useConnector);

export default Connector;
