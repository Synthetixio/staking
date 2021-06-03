import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
// import pageResults from 'graph-results-pager';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';

import snxData from 'synthetix-data';

type DebtSnapshotData = {
	account: string;
	block: number;
	debtBalanceOf: number;
	timestamp: number;
	globalDebtValue: number;
};

const useGetDebtSnapshotQuery = (options?: QueryConfig<DebtSnapshotData[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<DebtSnapshotData[]>(
		QUERY_KEYS.Debt.DebtSnapshot(walletAddress ?? '', network?.id!),
		async () => {
			// return await debtSnapshot({ account: walletAddress, max: 1000 });
			return await snxData.snx.debtSnapshot({ account: walletAddress, max: 1000 });
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useGetDebtSnapshotQuery;

// async function debtSnapshot({
// 	account = undefined,
// 	max = 100,
// 	minBlock = undefined,
// 	maxBlock = undefined,
// }) {
// 	return pageResults({
// 		api: 'https://api.thegraph.com/subgraphs/name/vbstreetz/synthetix',
// 		max,
// 		query: {
// 			entity: 'debtSnapshots',
// 			selection: {
// 				orderBy: 'timestamp',
// 				orderDirection: 'desc',
// 				where: {
// 					account: account ? `\\"${account}\\"` : undefined,
// 					block_gte: minBlock || undefined,
// 					block_lte: maxBlock || undefined,
// 				},
// 			},
// 			properties: [
// 				'id', // the transaction hash
// 				'timestamp', // the timestamp when this transaction happened
// 				'block', // the block in which this transaction happened
// 				'account', // the address of debt holder
// 				'balanceOf', // SNX balance in their wallet,
// 				'collateral', // Synthetix.collateral (all collateral the account has, including escrowed )'collateral', // Synthetix.collateral (all collateral the account has, including escrowed )
// 				'debtBalanceOf', // Account's Debt balance in sUSD
// 				'globalDebtValue', // Global debt value
// 			],
// 		},
// 	})
// 		.then((results) =>
// 			results.map(
// 				({
// 					id,
// 					timestamp,
// 					block,
// 					account,
// 					balanceOf,
// 					collateral,
// 					debtBalanceOf,
// 					globalDebtValue,
// 				}) => ({
// 					id,
// 					timestamp: Number(timestamp * 1000),
// 					block: Number(block),
// 					account,
// 					balanceOf: balanceOf ? balanceOf / 1e18 : null,
// 					collateral: collateral ? collateral / 1e18 : null,
// 					debtBalanceOf: debtBalanceOf ? debtBalanceOf / 1e18 : null,
// 					globalDebtValue: globalDebtValue ? globalDebtValue / 1e18 : null,
// 				})
// 			)
// 		)
// 		.catch((err) => console.error(err));
// }
