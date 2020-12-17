import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import BigNumber from 'bignumber.js';

const VESTING_ENTRIES_PAGINATION = 50;

export type EscrowData = {
	canVest: number;
	schedule: Array<{
		date: Date;
		quantity: number;
	}>;
	totalEscrowed: number;
	totalVested: number;
	tokenSaleEscrow: number;
};

const useEscrowDataQuery = (options?: QueryConfig<EscrowData>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<EscrowData>(
		QUERY_KEYS.Escrow.Data(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { RewardEscrowV2 },
				utils: { formatEther },
			} = synthetix.js!;

			const [numVestingEntries, totalEscrowed, totalVested] = await Promise.all([
				RewardEscrowV2.numVestingEntries(walletAddress),
				RewardEscrowV2.balanceOf(walletAddress),
				RewardEscrowV2.totalVestedAccountBalance(walletAddress),
			]);

			let vestingEntriesPromise = [];
			let vestingEntriesIdPromise = [];
			const totalVestingEntries = Number(numVestingEntries);
			console.log(totalVestingEntries);

			for (let index = 0; index < totalVestingEntries; index += VESTING_ENTRIES_PAGINATION) {
				const pagination =
					index + VESTING_ENTRIES_PAGINATION > totalVestingEntries
						? totalVestingEntries - index
						: VESTING_ENTRIES_PAGINATION;
				vestingEntriesPromise.push(
					RewardEscrowV2.getVestingSchedules(walletAddress, index, pagination)
				);
				vestingEntriesIdPromise.push(
					RewardEscrowV2.getAccountVestingEntryIDs(walletAddress, index, pagination)
				);
			}

			const [[vestingEntries], [vestingEntriesId]] = await Promise.all([
				Promise.all(vestingEntriesPromise),
				Promise.all(vestingEntriesIdPromise),
			]);

			const claimableAmount = await RewardEscrowV2.getVestingQuantity(
				walletAddress,
				vestingEntriesId
			);

			let schedule = [];

			vestingEntries.forEach(({ remainingAmount, endTime }) => {
				const quantity = remainingAmount / 1e18;
				if (remainingAmount) {
					schedule.push({
						quantity,
						date: new Date(Number(endTime) * 1000),
					});
				}
			});

			console.log('haha', schedule);
			// const [accountSchedule, totalEscrowed, totalVested, tokenSaleEscrow] = await Promise.all([
			// 	// RewardEscrow.checkAccountSchedule(walletAddress),
			// 	// RewardEscrow.totalEscrowedAccountBalance(walletAddress),
			// 	// RewardEscrow.totalVestedAccountBalance(walletAddress),
			// 	// SynthetixEscrow.balanceOf(walletAddress),
			// ]);

			// const schedule = [];
			// let canVest = 0;
			// const currentUnixTime = new Date().getTime();

			// for (let i = 0; i < accountSchedule.length; i += 2) {
			// 	const quantity = Number(formatEther(accountSchedule[i + 1]));

			// 	if (!accountSchedule[i].isZero() && quantity) {
			// 		if (accountSchedule[i] * 1000 < currentUnixTime) {
			// 			canVest += quantity;
			// 		}
			// 		schedule.push({
			// 			date: new Date(Number(accountSchedule[i]) * 1000),
			// 			quantity,
			// 		});
			// 	}
			// }
			return {
				claimableAmount: claimableAmount / 1e18,
				schedule,
				totalEscrowed: totalEscrowed / 1e18,
				totalVested: totalVested / 1e18,
				// tokenSaleEscrow: Number(formatEther(tokenSaleEscrow)),
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useEscrowDataQuery;
