import { useState, useEffect } from 'react';
import isBoolean from 'lodash/isBoolean';
import { createContainer } from 'unstated-next';
import { useSetRecoilState, useRecoilState } from 'recoil';
import { NetworkId } from '@synthetixio/contracts-interface';
import { loadProvider } from '@synthetixio/providers';
import {
	TransactionNotifier,
	TransactionNotifierInterface,
} from '@synthetixio/transaction-notifier';
import { ethers } from 'ethers';

import synthetix from 'lib/synthetix';

import { getDefaultNetworkId } from 'utils/network';

import { appReadyState } from 'store/app';
import {
	walletAddressState,
	networkState,
	walletWatchedState,
	isEOAWalletState,
} from 'store/wallet';

// import { Wallet as OnboardWallet } from 'bnc-onboard/dist/src/interfaces';

import useLocalStorage from 'hooks/useLocalStorage';

// import { initOnboard } from './config';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';

const useConnector = () => {
	const [, setNetwork] = useRecoilState(networkState);
	const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	// const [onboard, setOnboard] = useState<ReturnType<typeof initOnboard> | null>(null);
	const [
		transactionNotifier,
		setTransactionNotifier,
	] = useState<TransactionNotifierInterface | null>(null);
	const [, setAppReady] = useRecoilState(appReadyState);
	const [walletAddress, setWalletAddress] = useRecoilState(walletAddressState);
	const [walletWatched, setWalletWatched] = useRecoilState(walletWatchedState);
	const setIsEOAWallet = useSetRecoilState(isEOAWalletState);
	const [selectedWallet, setSelectedWallet] = useLocalStorage<string | null>(
		LOCAL_STORAGE_KEYS.SELECTED_WALLET,
		''
	);

	const [isMobile, setIsMobile] = useState<boolean | null>(null);

	useEffect(() => {
		setIsMobile(window.outerWidth < 600);
	}, []);

	// // init network and subscribe to network changes on desktop
	// useEffect(() => {
	// 	if (!(isBoolean(isMobile) && !isMobile)) return;

	// 	const init = async () => {
	// 		const networkId = await getDefaultNetworkId();
	// 		const provider = loadProvider({
	// 			networkId,
	// 			infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
	// 			provider: window.ethereum,
	// 		});

	// 		synthetix.setContractSettings({
	// 			networkId,
	// 			provider,
	// 		});

	// 		const network = synthetix.js ? { ...synthetix.js.network } : null;

	// 		setNetwork(network);
	// 		setProvider(provider);
	// 		setAppReady(true);

	// 		if (network) {
	// 			const onboard = initOnboard(network, {
	// 				address: setWalletAddress,
	// 				network: (networkId: number) => {
	// 					const isSupportedNetwork =
	// 						synthetix.chainIdToNetwork != null &&
	// 						synthetix.chainIdToNetwork[networkId as NetworkId]
	// 							? true
	// 							: false;
	// 					if (!isSupportedNetwork) return;
	// 					let provider;
	// 					if (onboard.getState().address) {
	// 						provider = loadProvider({
	// 							provider: onboard.getState().wallet.provider,
	// 							networkId,
	// 							infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
	// 						});

	// 						const signer = provider.getSigner();
	// 						synthetix.setContractSettings({
	// 							networkId,
	// 							provider,
	// 							signer,
	// 						});

	// 						// if (transactionNotifier) {
	// 						// 	transactionNotifier.setProvider(provider);
	// 						// } else {
	// 						setTransactionNotifier(new TransactionNotifier(provider));
	// 						// }

	// 						setSigner(signer);
	// 					} else {
	// 						provider = loadProvider({
	// 							provider: window.ethereum,
	// 							networkId,
	// 							infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
	// 						});

	// 						synthetix.setContractSettings({
	// 							networkId,
	// 							provider,
	// 						});
	// 					}

	// 					onboard.config({ networkId });
	// 					setProvider(provider);
	// 					setNetwork(
	// 						synthetix.js
	// 							? {
	// 									...synthetix.js.network,
	// 							  }
	// 							: null
	// 					);
	// 				},
	// 				wallet: async (wallet: OnboardWallet) => {
	// 					if (wallet.provider) {
	// 						const provider = loadProvider({ provider: wallet.provider });
	// 						const signer = provider.getSigner();
	// 						const network = await provider.getNetwork();
	// 						const networkId = network.chainId as NetworkId;

	// 						synthetix.setContractSettings({
	// 							networkId,
	// 							provider,
	// 							signer,
	// 						});
	// 						setProvider(provider);
	// 						setSigner(provider.getSigner());
	// 						setNetwork(
	// 							synthetix.js
	// 								? {
	// 										...synthetix.js.network,
	// 								  }
	// 								: null
	// 						);
	// 						setSelectedWallet(wallet.name);
	// 						setTransactionNotifier(new TransactionNotifier(provider));
	// 					} else {
	// 						// TODO: setting provider to null might cause issues, perhaps use a default provider?
	// 						// setProvider(null);
	// 						setSigner(null);
	// 						setWalletAddress(null);
	// 						setSelectedWallet(null);
	// 					}
	// 				},
	// 			});

	// 			setOnboard(onboard);
	// 		}
	// 	};

	// 	init();

	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [isMobile]);

	// subscribe to network changes on mobile
	// remove this once provider initialization on blocknative is fixed
	useEffect(() => {
		if (!(isBoolean(isMobile) && isMobile)) return;

		let isMounted = true;
		const unsubs = [() => (isMounted = false)];
		const load = async () => {
			if (window.ethereum) {
				const [accounts, chainId] = await Promise.all([
					window.ethereum.request({ method: 'eth_accounts' }),
					window.ethereum.request({ method: 'eth_chainId' }),
				]);
				if (isMounted) {
					if (accounts.length) setWalletAddress(accounts[0]);

					const networkId = chainId ? Number(chainId) : undefined;

					if (networkId) {
						const provider = loadProvider({ provider: window.ethereum });
						synthetix.setContractSettings({
							networkId,
							provider,
						});

						setNetwork(synthetix.js ? { ...synthetix.js.network } : null);
						setProvider(provider);
					}
				}
				// unsubs.push(() => window.ethereum.off('accountsChanged', onAccountsChanged));
				window.ethereum.on('accountsChanged', onAccountsChanged);
			}

			setAppReady(true);
		};
		const onAccountsChanged = (accounts: string[]) => {
			if (isMounted) {
				setWalletAddress(accounts[0] || null);
			}
		};
		load();

		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [isMobile, setNetwork, setProvider, setAppReady, setWalletAddress]);

	// // load previously saved wallet
	// useEffect(() => {
	// 	if (onboard && selectedWallet && !walletAddress) {
	// 		onboard.walletSelect(selectedWallet);
	// 	}
	// }, [onboard, selectedWallet, walletAddress]);

	useEffect(() => {
		const getAddressCode = async () => {
			if (!walletAddress || !provider) return;
			const code = await provider.getCode(walletAddress);
			// If code = 0x then it's an EOA wallet. Otherwise, it's a contract.
			setIsEOAWallet(code === '0x');
		};
		getAddressCode();
	}, [walletAddress, provider, setIsEOAWallet]);

	const connectWallet = async () => {
		if (isMobile) {
			if (window.ethereum) {
				const [account] = await window.ethereum.request({
					method: 'eth_requestAccounts',
				});
				setWalletAddress(account);
			}
		} else {
			// try {
			// 	if (onboard) {
			// 		onboard.walletReset();
			// 		const success = await onboard.walletSelect();
			// 		if (success) {
			// 			await onboard.walletCheck();
			// 			setWalletWatched(null);
			// 			setWalletAddress(null);
			// 		}
			// 	}
			// } catch (e) {
			// 	console.log(e);
			// }
		}
	};

	const disconnectWallet = async () => {
		if (isMobile) {
			setWalletAddress(null);
		} else {
			// try {
			// 	if (onboard) {
			// 		onboard.walletReset();
			// 	}
			// } catch (e) {
			// 	console.log(e);
			// }
		}
	};

	const switchAccounts = async () => {
		// try {
		// 	if (onboard) {
		// 		onboard.accountSelect();
		// 	}
		// } catch (e) {
		// 	console.log(e);
		// }
	};

	const isHardwareWallet = () => {
		// if (onboard) {
		// 	const onboardState = onboard.getState();
		// 	if (onboardState.address != null) {
		// 		return onboardState.wallet.type === 'hardware';
		// 	}
		// }
		return false;
	};

	return {
		provider,
		signer,
		connectWallet,
		disconnectWallet,
		switchAccounts,
		isHardwareWallet,
		selectedWallet,
		transactionNotifier,
	};
};

const Connector = createContainer(useConnector);

export default Connector;
