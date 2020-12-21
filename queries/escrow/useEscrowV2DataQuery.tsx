import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';

const VESTING_ENTRIES_PAGINATION = 50;

export type EscrowData = {
	claimableAmount: number;
	schedule: Schedule;
	totalEscrowed: number;
	totalVested: number;
	claimableEntryIds: number[];
};

type VestingEntry = {
	remainingAmount: number;
	entryID: number;
	endTime: number;
};

type Schedule = Array<
	| {
			quantity: number;
			date: Date;
	  }
	| []
>;

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
			} = synthetix.js!;

			const [numVestingEntries, totalEscrowed, totalVested] = await Promise.all([
				RewardEscrowV2.numVestingEntries(walletAddress),
				RewardEscrowV2.balanceOf(walletAddress),
				RewardEscrowV2.totalVestedAccountBalance(walletAddress),
			]);

			let vestingEntriesPromise = [];
			let vestingEntriesIdPromise = [];
			const totalVestingEntries = Number(numVestingEntries);

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

			let schedule: Schedule = [];
			let claimableEntryIds: number[] = [];

			vestingEntries.forEach(({ remainingAmount, entryID, endTime }: VestingEntry) => {
				const quantity = remainingAmount / 1e18;
				if (quantity) {
					claimableEntryIds.push(entryID);
					schedule.push({
						quantity,
						date: new Date(Number(endTime) * 1000),
					});
				}
			});

			return {
				claimableAmount: claimableAmount / 1e18,
				schedule,
				totalEscrowed: totalEscrowed / 1e18,
				totalVested: totalVested / 1e18,
				claimableEntryIds,
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useEscrowDataQuery;
