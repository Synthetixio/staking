import { useState, useEffect } from 'react';
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

import { getDefaultNetworkId, matchesNetworkErrorString, networkErrorMessage } from 'utils/network';

import { appReadyState } from 'store/app';
import {
	walletAddressState,
	networkState,
	walletWatchedState,
	isEOAWalletState,
} from 'store/wallet';

import { Wallet as OnboardWallet } from 'bnc-onboard/dist/src/interfaces';

import useLocalStorage from 'hooks/useLocalStorage';

import { initOnboard } from './config';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import UI from 'containers/UI';

const useConnector = () => {
	const [network, setNetwork] = useRecoilState(networkState);
	const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [onboard, setOnboard] = useState<ReturnType<typeof initOnboard> | null>(null);
	const [
		transactionNotifier,
		setTransactionNotifier,
	] = useState<TransactionNotifierInterface | null>(null);
	const [isAppReady, setAppReady] = useRecoilState(appReadyState);
	const [walletAddress, setWalletAddress] = useRecoilState(walletAddressState);
	const [walletWatched, setWalletWatched] = useRecoilState(walletWatchedState);
	const setIsEOAWallet = useSetRecoilState(isEOAWalletState);
	const [selectedWallet, setSelectedWallet] = useLocalStorage<string | null>(
		LOCAL_STORAGE_KEYS.SELECTED_WALLET,
		''
	);
	const { setNetworkError } = UI.useContainer();

	useEffect(() => {
		const init = async () => {
			try {
				const networkId = await getDefaultNetworkId();
				const provider = loadProvider({
					networkId,
					infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
					provider: window.ethereum,
				});

				synthetix.setContractSettings({
					networkId,
					provider,
				});

				setNetwork(synthetix.js ? { ...synthetix.js.network } : null);
				setProvider(provider);
				setAppReady(true);
			} catch (error) {
				if (matchesNetworkErrorString(error.message)) {
					setNetworkError(networkErrorMessage);
					window.ethereum.on('chainChanged', (_: string) => {
						window.location.reload();
					});
				}
			}
		};
		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (isAppReady && network) {
			const onboard = initOnboard(network, {
				address: setWalletAddress,
				network: (networkId: number) => {
					const isSupportedNetwork =
						synthetix.chainIdToNetwork != null && synthetix.chainIdToNetwork[networkId as NetworkId]
							? true
							: false;
					if (!isSupportedNetwork) {
						window.location.reload();
					}
					let provider;
					if (onboard.getState().address) {
						provider = loadProvider({
							provider: onboard.getState().wallet.provider,
							networkId,
							infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
						});

						const signer = provider.getSigner();
						synthetix.setContractSettings({
							networkId,
							provider,
							signer,
						});

						if (transactionNotifier) {
							transactionNotifier.setProvider(provider);
						} else {
							setTransactionNotifier(new TransactionNotifier(provider));
						}

						setSigner(signer);
					} else {
						provider = loadProvider({
							provider: window.ethereum,
							networkId,
							infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
						});

						synthetix.setContractSettings({
							networkId,
							provider,
						});
					}

					onboard.config({ networkId });
					setProvider(provider);
					setNetwork(
						synthetix.js
							? {
									...synthetix.js.network,
							  }
							: null
					);
				},
				wallet: async (wallet: OnboardWallet) => {
					if (wallet.provider) {
						const provider = loadProvider({ provider: wallet.provider });
						const signer = provider.getSigner();
						const network = await provider.getNetwork();
						const networkId = network.chainId as NetworkId;

						synthetix.setContractSettings({
							networkId,
							provider,
							signer,
						});
						setProvider(provider);
						setSigner(provider.getSigner());
						setNetwork(
							synthetix.js
								? {
										...synthetix.js.network,
								  }
								: null
						);
						setSelectedWallet(wallet.name);
						setTransactionNotifier(new TransactionNotifier(provider));
					} else {
						const networkId = await getDefaultNetworkId();
						const provider = loadProvider({
							networkId,
							infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
							provider: window.ethereum,
						});

						setProvider(provider);
						setSigner(null);
						setWalletAddress(null);
						setSelectedWallet(null);
					}
				},
			});
			setOnboard(onboard);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAppReady]);

	useEffect(() => {
		setWalletAddress(walletWatched);
	}, [walletWatched, setWalletAddress]);

	// load previously saved wallet
	useEffect(() => {
		if (onboard && selectedWallet && !walletAddress) {
			onboard.walletSelect(selectedWallet);
		}
	}, [onboard, selectedWallet, walletAddress]);

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
		try {
			if (onboard) {
				onboard.walletReset();
				const success = await onboard.walletSelect();
				if (success) {
					await onboard.walletCheck();
					setWalletWatched(null);
				}
			}
		} catch (e) {
			console.log(e);
		}
	};

	const disconnectWallet = async () => {
		try {
			if (onboard) {
				onboard.walletReset();
			}
		} catch (e) {
			console.log(e);
		}
	};

	const switchAccounts = async () => {
		try {
			if (onboard) {
				onboard.accountSelect();
			}
		} catch (e) {
			console.log(e);
		}
	};

	const isHardwareWallet = () => {
		if (onboard) {
			const onboardState = onboard.getState();
			if (onboardState.address != null) {
				return onboardState.wallet.type === 'hardware';
			}
		}
		return false;
	};

	return {
		provider,
		signer,
		onboard,
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
