import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
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
						isConfirmed: true,
						transactionHash: l.transactionHash,
					};
				})
			);

			return events;
		},
		{
			enabled: isAppReady && isWalletConnected && provider,
			...options,
		}
	);
};

export default useGetDebtDataQuery;
