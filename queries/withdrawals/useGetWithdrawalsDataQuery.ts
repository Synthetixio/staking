import { useEffect, useState } from 'react';
import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
// import { providers } from 'ethers'; // todo: fix lint error & revert to this
import providers from '@ethersproject/providers';
import orderBy from 'lodash/orderBy';
import {
	optimismMessengerWatcher,
	L2_TO_L1_NETWORK_MAPPER,
	OptimismWatcher,
} from '@synthetixio/optimism-networks';
import { loadProvider } from '@synthetixio/providers';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';

import { isWalletConnectedState, networkState, walletAddressState, isL2State } from 'store/wallet';
import { appReadyState } from 'store/app';

const NUM_BLOCKS_TO_FETCH = 1000000;

export type WithdrawRecord = {
	timestamp: number;
	amount: number;
	isConfirmed: boolean;
	transactionHash: string;
};

export type WithdrawalHistory = Array<WithdrawRecord>;

const useGetWithdrawalsDataQuery = (options?: QueryConfig<WithdrawalHistory>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const { provider } = Connector.useContainer();
	const [watcher, setWatcher] = useState<OptimismWatcher | null>(null);
	const isL2 = useRecoilValue(isL2State);

	useEffect(() => {
		if (network && provider && isL2) {
			setWatcher(
				optimismMessengerWatcher({
					layerOneProvider: loadProvider({
						networkId: L2_TO_L1_NETWORK_MAPPER[network.id],
						infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
					}),
					// @ts-ignore
					layerTwoProvider: provider as providers.Web3Provider,
					layerTwoNetworkId: network.id,
				})
			);
		}
	}, [network, provider, isL2]);

	return useQuery<WithdrawalHistory>(
		QUERY_KEYS.Withdrawals(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { SynthetixBridgeToBase },
			} = synthetix.js!;
			if (!provider || !watcher) return [];
			const blockNumber = await provider.getBlockNumber();
			const startBlock = Math.max(blockNumber - NUM_BLOCKS_TO_FETCH, 0);
			const filters = SynthetixBridgeToBase.filters.WithdrawalInitiated(walletAddress);
			const logs = await provider.getLogs({ ...filters, fromBlock: startBlock });
			const events = await Promise.all(
				logs.map(async (l) => {
					const block = await provider.getBlock(l.blockNumber);
					const { args } = SynthetixBridgeToBase.interface.parseLog(l);
					const timestamp = Number(block.timestamp * 1000);
					return {
						timestamp,
						amount: args._amount / 1e18,
						transactionHash: l.transactionHash,
					};
				})
			);
			const eventsWithReceipt = await Promise.all(
				events.map(async (event) => {
					const msgHashes = await watcher.getMessageHashesFromL2Tx(event.transactionHash);
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
			enabled: isAppReady && isWalletConnected && provider && watcher && isL2,
			...options,
		}
	);
};

export default useGetWithdrawalsDataQuery;
