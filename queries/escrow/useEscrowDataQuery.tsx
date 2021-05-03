import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import chunk from 'lodash/chunk';
import synthetix from 'lib/synthetix';
import { orderBy, flatten } from 'lodash';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';

const VESTING_ENTRIES_PAGINATION = 50;

export type EscrowData = {
	claimableAmount: number;
	schedule: Schedule;
	totalEscrowed: number;
	totalVested: number;
	totalBalancePendingMigration: number;
	claimableEntryIds?: number[];
	claimableEntryIdsInChunk?: number[][];
};

export type Schedule = Array<
	| {
			quantity: number;
			date: Date;
	  }
	| []
>;

type VestingEntry = {
	escrowAmount: number;
	entryID: number;
	endTime: number;
};

const useEscrowDataQuery = (options?: QueryConfig<EscrowData>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<EscrowData>(
		QUERY_KEYS.Escrow.StakingRewards(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { RewardEscrowV2 },
			} = synthetix.js!;

			const [
				numVestingEntries,
				totalEscrowed,
				totalVested,
				totalBalancePendingMigration,
			] = await Promise.all([
				RewardEscrowV2.numVestingEntries(walletAddress),
				RewardEscrowV2.balanceOf(walletAddress),
				RewardEscrowV2.totalVestedAccountBalance(walletAddress),
				RewardEscrowV2.totalBalancePendingMigration(walletAddress),
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

			const vestingEntries = flatten(await Promise.all(vestingEntriesPromise));
			const vestingEntriesId = flatten(await Promise.all(vestingEntriesIdPromise));

			let claimableAmount = 0;

			if (vestingEntriesId != null) {
				claimableAmount = await RewardEscrowV2.getVestingQuantity(walletAddress, vestingEntriesId);
			}

			let unorderedSchedule: Schedule = [];
			let claimableEntryIds: number[] = [];

			(vestingEntries ?? []).forEach(({ escrowAmount, entryID, endTime }: VestingEntry) => {
				const quantity = escrowAmount / 1e18;
				if (quantity) {
					claimableEntryIds.push(entryID);
					unorderedSchedule.push({
						quantity,
						date: new Date(Number(endTime) * 1000),
					});
				}
			});

			const schedule = orderBy(unorderedSchedule, 'date', 'asc');

			const claimableEntryIdsInChunk =
				claimableEntryIds && claimableEntryIds.length > 0 ? chunk(claimableEntryIds, 26) : [];

			return {
				claimableAmount: claimableAmount / 1e18,
				schedule,
				totalEscrowed: totalEscrowed / 1e18,
				totalVested: totalVested / 1e18,
				claimableEntryIds,
				claimableEntryIdsInChunk,
				totalBalancePendingMigration: totalBalancePendingMigration / 1e18,
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useEscrowDataQuery;
