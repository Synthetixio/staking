import { useEffect, useState } from 'react';
import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { providers } from 'ethers';
import orderBy from 'lodash/orderBy';
import {
	optimismMessengerWatcher,
	L1_TO_L2_NETWORK_MAPPER,
	OptimismWatcher,
} from '@synthetixio/optimism-networks';
import { getOptimismProvider } from '@synthetixio/providers';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';

const NUM_BLOCKS_TO_FETCH = 1000000;

export type DepositRecord = {
	timestamp: number;
	amount: number;
	isConfirmed: boolean;
	transactionHash: string;
};

export type DepositHistory = Array<DepositRecord>;

const useGetDepositsDataQuery = (options?: QueryConfig<DepositHistory>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const { provider } = Connector.useContainer();
	const [watcher, setWatcher] = useState<OptimismWatcher | null>(null);

	useEffect(() => {
		if (network && !network.useOvm && provider) {
			setWatcher(
				optimismMessengerWatcher({
					layerOneProvider: provider as providers.Web3Provider,
					layerTwoProvider: getOptimismProvider({
						layerOneNetworkId: network.id,
					}) as providers.Web3Provider,
					layerTwoNetworkId: L1_TO_L2_NETWORK_MAPPER[network.id],
				})
			);
		}
	}, [network, provider]);

	return useQuery<DepositHistory>(
		QUERY_KEYS.Deposits(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { SynthetixBridgeToOptimism },
			} = synthetix.js!;
			if (!provider || !watcher) return [];
			const blockNumber = await provider.getBlockNumber();
			console.log('here');
			const startBlock = Math.max(blockNumber - NUM_BLOCKS_TO_FETCH, 0);
			const filters = SynthetixBridgeToOptimism.filters.Deposit(walletAddress);
			const logs = await provider.getLogs({ ...filters, fromBlock: startBlock });
			const events = await Promise.all(
				logs.map(async (l) => {
					const block = await provider.getBlock(l.blockNumber);
					const { args } = SynthetixBridgeToOptimism.interface.parseLog(l);
					const timestamp = Number(block.timestamp * 1000);
					return {
						timestamp,
						amount: args.amount / 1e18,
						transactionHash: l.transactionHash,
					};
				})
			);
			const eventsWithReceipt = await Promise.all(
				events.map(async (event) => {
					const msgHashes = await watcher.getMessageHashesFromL1Tx(event.transactionHash);
					const receipt = await watcher.getL2TransactionReceipt(msgHashes[0], false);
					return {
						...event,
						isConfirmed: !!receipt,
					};
				})
			);

			return orderBy(eventsWithReceipt, ['timestamp'], ['desc']);
		},
		{
			enabled: isAppReady && isWalletConnected && provider && watcher,
			...options,
		}
	);
};

export default useGetDepositsDataQuery;
