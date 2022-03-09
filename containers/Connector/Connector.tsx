import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import {
	TransactionNotifier,
	TransactionNotifierInterface,
} from '@synthetixio/transaction-notifier';
import { loadProvider } from '@synthetixio/providers';

import { getDefaultNetworkId, getIsOVM, isSupportedNetworkId } from 'utils/network';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
	NetworkId,
	SynthetixJS,
	synthetix,
	NetworkNameById,
	NetworkIdByName,
} from '@synthetixio/contracts-interface';
import { ethers } from 'ethers';
import { switchToL1 } from '@synthetixio/optimism-networks';

import { appReadyState } from 'store/app';
import {
	walletAddressState,
	networkState,
	ensNameState,
	walletWatchedState,
	ensAvatarState,
} from 'store/wallet';

import { Wallet as OnboardWallet } from 'bnc-onboard/dist/src/interfaces';

import useLocalStorage from 'hooks/useLocalStorage';

import { initOnboard } from './config';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { CurrencyKey, ETH_ADDRESS } from 'constants/currency';
import { synthToContractName } from 'utils/currencies';
import { keyBy } from 'lodash';
import { useMemo } from 'react';

const useConnector = () => {
	const [network, setNetwork] = useRecoilState(networkState);
	const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);
	const [L1DefaultProvider, _] = useState<ethers.providers.BaseProvider>(
		loadProvider({
			infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
			networkId: NetworkIdByName.mainnet,
		})
	);
	const [L2DefaultProvider, __] = useState<ethers.providers.BaseProvider>(
		loadProvider({
			infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
			networkId: NetworkIdByName['mainnet-ovm'],
		})
	);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [synthetixjs, setSynthetixjs] = useState<SynthetixJS | null>(null);
	const [onboard, setOnboard] = useState<ReturnType<typeof initOnboard> | null>(null);
	const [isAppReady, setAppReady] = useRecoilState(appReadyState);
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
	useEffect(() => {
		const init: () => void = async () => {
			if (!window.ethereum || selectedWallet !== 'Browser Wallet') {
				setAppReady(true);
				// For non browser wallets we use mainnet by default. And the app/wallet will trigger wallet change events if needed
				setNetwork({
					name: NetworkNameById[NetworkIdByName.mainnet],
					id: NetworkIdByName.mainnet,
					useOvm: false,
				});

				const provider = loadProvider({
					networkId: NetworkIdByName.mainnet,
					infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
				});
				setProvider(provider);
				setSynthetixjs(synthetix({ networkId: NetworkIdByName.mainnet, useOvm: false, provider }));
				return;
			}
			const networkId = await getDefaultNetworkId();
			if (!isSupportedNetworkId(networkId)) {
				// When not on supported network: Switch to l1 and try again
				await switchToL1({ ethereum: window.ethereum });
				return init();
			}

			const provider = loadProvider({
				networkId,
				infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
				provider: window.ethereum as any, // loadProvider as incorrect types for provider
			});

			const useOvm = getIsOVM(Number(networkId));

			const snxjs = synthetix({ provider, networkId, useOvm });

			setNetwork(snxjs.network);
			setSynthetixjs(snxjs);
			setProvider(provider);
			setAppReady(true);
		};

		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const setUserAddress = async (address: string) => {
		setWalletAddress(address);
		const networkId = await getDefaultNetworkId();
		const provider = loadProvider({
			networkId,
			infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
			provider: window.ethereum as any, // loadProvider as incorrect types for provider
		});
		if (provider && address) {
			const ensName: string = await provider.lookupAddress(address);
			let avatar = ensName ? await provider.getAvatar(ensName) : null;
			setEnsName(ensName);
			setEnsAvatar(avatar);
		}
	};

	useEffect(() => {
		if (isAppReady && network) {
			const onboard = initOnboard(network.id, {
				address: setUserAddress,
				network: (networkId) => {
					if (!networkId) return; // user disconnected the wallet

					if (!isSupportedNetworkId(networkId)) {
						// This should only happen when a user is connected and changes to an unsupported network
						if (window.ethereum) {
							switchToL1({ ethereum: window.ethereum });
						}
						// We can return here since the network change will trigger this callback again
						return;
					}

					const provider = loadProvider({
						provider: onboard.getState().wallet.provider,
					});
					const signer = provider.getSigner();
					const useOvm = getIsOVM(networkId);

					const snxjs = synthetix({ provider, networkId: networkId as NetworkId, signer, useOvm });

					onboard.config({ networkId });
					if (transactionNotifier) {
						transactionNotifier.setProvider(provider);
					} else {
						setTransactionNotifier(new TransactionNotifier(provider));
					}
					setProvider(provider);
					setSynthetixjs(snxjs);
					setSigner(signer);
					setNetwork(snxjs.network);
				},
				wallet: async (wallet: OnboardWallet) => {
					if (wallet.provider) {
						const provider = loadProvider({ provider: wallet.provider });
						const network = await provider.getNetwork();
						const networkId = Number(network.chainId);
						if (!isSupportedNetworkId(networkId)) {
							if (window.ethereum) {
								await switchToL1({ ethereum: window.ethereum });
							}
							// We return here and expect the network change to trigger onboard's network callback
							return;
						}
						const useOvm = getIsOVM(Number(networkId));

						const snxjs = synthetix({ provider, networkId, signer: provider.getSigner(), useOvm });

						setProvider(provider);
						setSigner(provider.getSigner());
						setSynthetixjs(snxjs);
						setNetwork(snxjs.network);
						setSelectedWallet(wallet.name);
						setTransactionNotifier(new TransactionNotifier(provider));
					} else {
						// TODO: setting provider to null might cause issues, perhaps use a default provider?
						// setProvider(null);
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

	// load previously saved wallet
	useEffect(() => {
		if (onboard && selectedWallet && !walletAddress) {
			onboard.walletSelect(selectedWallet);
		}
	}, [onboard, selectedWallet, walletAddress]);

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
			if (onboard) {
				onboard.walletReset();
				const success = await onboard.walletSelect();
				if (success) {
					await onboard.walletCheck();
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

	const getTokenAddress = (currencyKey: CurrencyKey) => {
		if (synthetixjs == null) {
			return null;
		}

		return currencyKey === 'ETH'
			? ETH_ADDRESS
			: synthetixjs!.contracts[synthToContractName(currencyKey!)].address;
	};

	return {
		network,
		provider,
		signer,
		synthetixjs,
		synthsMap,
		tokensMap,
		onboard,
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
