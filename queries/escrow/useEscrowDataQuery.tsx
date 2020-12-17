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
				contracts: { RewardEscrowV2, SynthetixEscrow },
				utils: { formatEther },
			} = synthetix.js!;

			const numVestingEntries = Number(await RewardEscrowV2.numVestingEntries(walletAddress));
			let vestingEntriesPromise = [];

			for (let index = 0; index < numVestingEntries; index += VESTING_ENTRIES_PAGINATION) {
				const pagination =
					index + VESTING_ENTRIES_PAGINATION > numVestingEntries
						? numVestingEntries - index
						: VESTING_ENTRIES_PAGINATION;
				vestingEntriesPromise.push(
					RewardEscrowV2.getVestingSchedules(walletAddress, index, pagination)
				);
			}

			const [vestingEntries] = await Promise.all(vestingEntriesPromise);

			console.log(vestingEntries);

			const schedule = vestingEntries.map(({ escrowAmount, endTime }) => {
				return {
					quantity: escrowAmount / 1e18,
					date: new Date(Number(endTime) * 1000),
				};
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
				// canVest,
				schedule,
				// totalEscrowed: Number(formatEther(totalEscrowed)),
				// totalVested: Number(formatEther(totalVested)),
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
