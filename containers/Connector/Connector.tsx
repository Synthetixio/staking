import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { AppState } from '@web3-onboard/core';
import { createContainer } from 'unstated-next';
import TransactionNotifier from '@synthetixio/transaction-notifier';
import { loadProvider } from '@synthetixio/providers';

import { getIsOVM, isSupportedNetworkId } from 'utils/network';

import { synthetix, NetworkNameById, NetworkIdByName } from '@synthetixio/contracts-interface';
import { ethers, providers } from 'ethers';

import { onboard as Web3Onboard } from './config';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { CurrencyKey, ETH_ADDRESS } from 'constants/currency';
import { synthToContractName } from 'utils/currencies';
import { keyBy } from 'lodash';
import { initialState, reducer } from './reducer';

import { getChainIdHex, getNetworkIdFromHex } from 'utils/infura';

const useConnector = () => {
	const [state, dispatch] = useReducer(reducer, initialState);

	const {
		isAppReady,
		provider,
		network,
		signer,
		synthetixjs,
		walletAddress,
		watchedWallet,
		ensName,
		ensAvatar,
		onboard,
	} = state;

	// Ethereum Mainnet
	const L1DefaultProvider: providers.Web3Provider = useMemo(
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
	const L2DefaultProvider: providers.Web3Provider = useMemo(
		() =>
			loadProvider({
				infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
					? process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
					: '0',
				networkId: NetworkIdByName['mainnet-ovm'],
			}),
		[]
	);

	const transactionNotifier = useMemo(
		() => new TransactionNotifier(L1DefaultProvider),
		[L1DefaultProvider]
	);

	const [synthsMap, tokensMap] = useMemo(() => {
		if (synthetixjs == null) {
			return [{}, {}];
		}

		return [keyBy(synthetixjs.synths, 'name'), keyBy(synthetixjs.tokens, 'symbol')];
	}, [synthetixjs]);

	useEffect(() => {
		// First we want to check to see if something is in local storage
		dispatch({ type: 'app_ready', payload: Web3Onboard }); //
	}, []);

	useEffect(() => {
		if (provider) {
			transactionNotifier.setProvider(provider);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider]);

	useEffect(() => {
		const previousWalletsSerialised = localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_WALLET);
		const previousWallets: string[] | null = previousWalletsSerialised
			? JSON.parse(previousWalletsSerialised)
			: null;

		if (onboard && previousWallets) {
			(async () => {
				try {
					await onboard.connectWallet({
						autoSelect: {
							label: previousWallets[0],
							disableModals: true,
						},
					});
				} catch (error) {
					console.log(error);
				}
			})();
		}

		const updateState = (update: AppState) => {
			if (update.wallets.length > 0) {
				const wallet = update.wallets[0].accounts[0];
				const { id } = update.wallets[0].chains[0];
				const networkId = getNetworkIdFromHex(id);

				const isSupported = isSupportedNetworkId(networkId);

				if (!isSupported) {
					// Switch to mainnet ethereum by default
					(async () => {
						await onboard?.setChain({ chainId: getChainIdHex(NetworkIdByName.mainnet) });
					})();
				} else {
					const network = {
						id: networkId,
						name: NetworkNameById[networkId],
						useOvm: getIsOVM(networkId),
					};

					const provider = new ethers.providers.Web3Provider(update.wallets[0].provider, {
						name: network.name,
						chainId: networkId,
					});

					const signer = provider.getSigner();
					const useOvm = getIsOVM(Number(networkId));
					const synthetixjs = synthetix({ provider, networkId, useOvm });

					dispatch({
						type: 'config_update',
						payload: {
							address: wallet.address,
							network,
							provider,
							signer,
							synthetixjs,
							ensName: wallet?.ens?.name || null,
							ensAvatar: wallet?.ens?.avatar?.url || null,
						},
					});

					const connectedWallets = update.wallets.map(({ label }) => label);
					localStorage.setItem(
						LOCAL_STORAGE_KEYS.SELECTED_WALLET,
						JSON.stringify(connectedWallets)
					);
				}
			} else {
				dispatch({ type: 'wallet_disconnected' });
			}
		};

		if (onboard) {
			const state = onboard.state.select();

			const { unsubscribe } = state.subscribe(updateState);

			return () => {
				if (process.env.NODE_ENV !== 'development' && unsubscribe) unsubscribe();
			};
		}

		// Always keep this hook with the single dependency.
	}, [onboard]);

	useEffect(() => {
		// We need to figure out what to do when the wallet address changes
		if (walletAddress && !ensName) {
			(async () => {
				const ensN: string | null = await L1DefaultProvider.lookupAddress(walletAddress);
				const ensA = ensName ? await L1DefaultProvider.getAvatar(ensName) : null;
				if (ensN) {
					dispatch({ type: 'set_ens', payload: { ensName: ensN, ensAvatar: ensA } });
				}
			})();
		}
	}, [walletAddress, L1DefaultProvider, ensName, network]);

	useEffect(() => {
		// If we are 'watching a wallet, we update the provider'
		if (watchedWallet) {
			const provider = loadProvider({ infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID });
			if (provider) {
				// setProvider(provider);
			}
		}
	}, [watchedWallet]);

	const connectWallet = useCallback(async () => {
		try {
			if (onboard) {
				await onboard.connectWallet();
			}
		} catch (e) {
			console.log(e);
		}
	}, [onboard]);

	const disconnectWallet = useCallback(async () => {
		try {
			if (onboard) {
				const [primaryWallet] = onboard.state.get().wallets;
				onboard.disconnectWallet({ label: primaryWallet.label });
				localStorage.removeItem(LOCAL_STORAGE_KEYS.SELECTED_WALLET);
			}
		} catch (e) {
			console.log(e);
		}
	}, [onboard]);

	const switchAccounts = useCallback(
		async (chainId?: string) => {
			try {
				if (onboard && chainId) {
					await onboard.setChain({ chainId });
				}
			} catch (e) {
				console.log(e);
			}
		},
		[onboard]
	);

	const isHardwareWallet = useCallback(() => {
		if (onboard) {
			const walletLabel = onboard.state.get().wallets[0].label;
			return walletLabel === 'Trezor' || 'Ledger';
		}
		return false;
	}, [onboard]);

	const getTokenAddress = useCallback(
		(currencyKey: CurrencyKey) => {
			if (synthetixjs == null) {
				return null;
			}

			return currencyKey === 'ETH'
				? ETH_ADDRESS
				: synthetixjs!.contracts[synthToContractName(currencyKey!)].address;
		},
		[synthetixjs]
	);

	return {
		isAppReady,
		network,
		provider,
		signer,
		walletAddress,
		synthetixjs,
		synthsMap,
		tokensMap,
		isWalletConnected: !!walletAddress,
		isL2: network?.useOvm ?? false,
		connectWallet,
		disconnectWallet,
		switchAccounts,
		isHardwareWallet,
		transactionNotifier,
		selectedWallet: walletAddress,
		getTokenAddress,
		L1DefaultProvider,
		L2DefaultProvider,
		ensName,
		ensAvatar,
	};
};

const Connector = createContainer(useConnector);

export default Connector;
