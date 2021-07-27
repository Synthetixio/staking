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
	delegateWalletState,
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
	const setAppReady = useSetRecoilState(appReadyState);
	const [walletAddress, setWalletAddress] = useRecoilState(walletAddressState);
	const [walletWatched, setWalletWatched] = useRecoilState(walletWatchedState);
	const setIsEOAWallet = useSetRecoilState(isEOAWalletState);
	const setDelegateWallet = useSetRecoilState(delegateWalletState);
	const [selectedWallet, setSelectedWallet] = useLocalStorage<string | null>(
		LOCAL_STORAGE_KEYS.SELECTED_WALLET,
		''
	);
	const { networkError, setNetworkError } = UI.useContainer();

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

				const onboard = initOnboard(networkId, {
					address: setWalletAddress,
					network: async (networkId: number) => {
						if (networkId) {
							try {
								setNetworkError(null);

								const isSupportedNetwork =
									synthetix.chainIdToNetwork != null &&
									synthetix.chainIdToNetwork[networkId as NetworkId]
										? true
										: false;
								if (!isSupportedNetwork) {
									onboard.walletReset();
									setSelectedWallet(null);
									setWalletAddress(null);
									setNetworkError(networkErrorMessage);
								} else {
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
								}
							} catch (error) {
								console.log(error);
							}
						}
					},
					wallet: async (wallet: OnboardWallet) => {
						try {
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

								setSigner(null);
								setProvider(provider);
								setWalletAddress(null);
								setSelectedWallet(null);
							}
						} catch (error) {
							console.log(error);
						}
					},
				});
				setOnboard(onboard);
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
		// @notice we only want to initiate once on load
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	useEffect(() => {
		setDelegateWallet(null);
	}, [network, walletAddress, setDelegateWallet]);

	const connectWallet = async () => {
		try {
			if (onboard && !networkError) {
				onboard.walletReset();
				const networkId = await getDefaultNetworkId();
				let success;
				if (networkId === NetworkId['Mainnet-Ovm'] || networkId === NetworkId['Kovan-Ovm']) {
					success = await onboard.walletSelect('Browser Wallet');
				} else {
					success = await onboard.walletSelect();
				}

				if (success) {
					await onboard.walletCheck();
					setWalletWatched(null);
				}
			}
		} catch (e) {
			console.log(e);
		}
	};

	const disconnectWallet = () => {
		setSelectedWallet(null);
		setWalletAddress(null);
		setDelegateWallet(null);
		if (onboard) {
			onboard.walletReset();
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
