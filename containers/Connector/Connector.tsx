import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import { NetworkId } from '@synthetixio/js';
import { ethers } from 'ethers';

import synthetix from 'lib/synthetix';

import { getDefaultNetworkId } from 'utils/network';

import { appReadyState, languageState } from 'store/app';
import { walletAddressState, networkState, walletWatchedState } from 'store/wallet';

import { Wallet as OnboardWallet } from 'bnc-onboard/dist/src/interfaces';

import useLocalStorage from 'hooks/useLocalStorage';

import { initOnboard, initNotify } from './config';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';

const useConnector = () => {
	const [network, setNetwork] = useRecoilState(networkState);
	const language = useRecoilValue(languageState);
	const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [onboard, setOnboard] = useState<ReturnType<typeof initOnboard> | null>(null);
	const [notify, setNotify] = useState<ReturnType<typeof initNotify> | null>(null);
	const [isAppReady, setAppReady] = useRecoilState(appReadyState);
	const setWalletAddress = useSetRecoilState(walletAddressState);
	const [walletWatched, setWalletWatched] = useRecoilState(walletWatchedState);
	const [selectedWallet, setSelectedWallet] = useLocalStorage<string | null>(
		LOCAL_STORAGE_KEYS.SELECTED_WALLET,
		''
	);

	useEffect(() => {
		const init = async () => {
			// TODO: need to verify we support the network
			const networkId = await getDefaultNetworkId();

			// @ts-ignore
			const provider = new ethers.providers.InfuraProvider(
				networkId,
				process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
			);

			synthetix.setContractSettings({
				networkId,
				provider,
			});

			// @ts-ignore
			setNetwork(synthetix.js?.network);
			setProvider(provider);
			setAppReady(true);
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

					if (isSupportedNetwork) {
						const provider = new ethers.providers.Web3Provider(onboard.getState().wallet.provider);
						const signer = provider.getSigner();

						synthetix.setContractSettings({
							networkId,
							provider,
							signer,
						});
						onboard.config({ networkId });
						notify.config({ networkId });
						setProvider(provider);
						setSigner(signer);

						setNetwork({
							id: networkId,
							// @ts-ignore
							name: synthetix.chainIdToNetwork[networkId],
						});
					}
				},
				wallet: async (wallet: OnboardWallet) => {
					if (wallet.provider) {
						const provider = new ethers.providers.Web3Provider(wallet.provider);
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
						setNetwork({
							id: networkId,
							// @ts-ignore
							name: synthetix.chainIdToNetwork[networkId],
						});
						setSelectedWallet(wallet.name);
					} else {
						// TODO: setting provider to null might cause issues, perhaps use a default provider?
						// setProvider(null);
						setSigner(null);
						setWalletAddress(null);
						setSelectedWallet(null);
					}
				},
			});
			const notify = initNotify(network, {
				clientLocale: language,
			});

			setOnboard(onboard);
			setNotify(notify);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAppReady]);

	useEffect(() => {
		setWalletAddress(walletWatched);
	}, [walletWatched, setWalletAddress]);

	// load previously saved wallet
	useEffect(() => {
		if (onboard && selectedWallet) {
			onboard.walletSelect(selectedWallet);
		}
	}, [onboard, selectedWallet]);

	useEffect(() => {
		if (notify) {
			notify.config({
				clientLocale: language,
			});
		}
	}, [language, notify]);

	const resetCachedUI = () => {
		// TODO: implement
	};

	const connectWallet = async () => {
		try {
			if (onboard) {
				onboard.walletReset();
				const success = await onboard.walletSelect();
				if (success) {
					await onboard.walletCheck();
					setWalletWatched(null);
					resetCachedUI();
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
				resetCachedUI();
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
		notify,
		connectWallet,
		disconnectWallet,
		switchAccounts,
		isHardwareWallet,
		selectedWallet,
	};
};

const Connector = createContainer(useConnector);

export default Connector;
