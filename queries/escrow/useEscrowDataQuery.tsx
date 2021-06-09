import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import chunk from 'lodash/chunk';
import synthetix from 'lib/synthetix';
import { orderBy, flatten } from 'lodash';
import { ethers } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState, isL2State } from 'store/wallet';
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

const useEscrowDataQuery = (options?: UseQueryOptions<EscrowData>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);

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
				isL2
					? ethers.BigNumber.from(0)
					: RewardEscrowV2.totalBalancePendingMigration(walletAddress),
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

			const [
				formattedClaimableAmount,
				formattedTotalEscrowed,
				formattedTotalVested,
				formattedTotalBalanceMigration,
			] = [claimableAmount, totalEscrowed, totalVested, totalBalancePendingMigration].map((data) =>
				Number(synthetix.js?.utils.formatEther(data))
			);

			return {
				claimableAmount: formattedClaimableAmount,
				schedule,
				totalEscrowed: formattedTotalEscrowed,
				totalVested: formattedTotalVested,
				claimableEntryIds,
				claimableEntryIdsInChunk,
				totalBalancePendingMigration: formattedTotalBalanceMigration,
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useEscrowDataQuery;
