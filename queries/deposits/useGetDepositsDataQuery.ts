import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';
import { providers } from 'ethers';
import orderBy from 'lodash/orderBy';
import { Watcher } from '@eth-optimism/watcher';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { L1_MESSENGER_ADDRESS, L2_MESSENGER_ADDRESS, OVM_RPC_URL } from 'constants/ovm';
import Connector from 'containers/Connector';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { toBigNumber } from 'utils/formatters/number';

const NUM_BLOCKS_TO_FETCH = 1000000;

export type DepositRecord = {
	timestamp: number;
	amount: number;
	isConfirmed: boolean;
	transactionHash: string;
};

export type DepositHistory = Array<DepositRecord>;

const useGetDebtDataQuery = (options?: QueryConfig<DepositHistory>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const { provider } = Connector.useContainer();

	const watcher = new Watcher({
		l1: {
			provider,
			messengerAddress: L1_MESSENGER_ADDRESS,
		},
		l2: {
			provider: new providers.JsonRpcProvider(OVM_RPC_URL),
			messengerAddress: L2_MESSENGER_ADDRESS,
		},
	});

	return useQuery<DepositHistory>(
		QUERY_KEYS.Deposits(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { SynthetixBridgeToOptimism },
			} = synthetix.js!;
			if (!provider) return [];
			const blockNumber = await provider.getBlockNumber();
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
			enabled: isAppReady && isWalletConnected && provider,
			...options,
		}
	);
};

export default useGetDebtDataQuery;
