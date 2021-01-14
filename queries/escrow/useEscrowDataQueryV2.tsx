import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { EscrowData, Schedule } from 'hooks/useEscrowDataQueryWrapper';

const VESTING_ENTRIES_PAGINATION = 50;

type VestingEntry = {
	escrowAmount: number;
	entryID: number;
	endTime: number;
};

const useEscrowDataQueryV2 = (options?: QueryConfig<EscrowData>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<EscrowData>(
		QUERY_KEYS.Escrow.DataV2(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { RewardEscrowV2 },
				utils: { formatEther },
			} = synthetix.js!;

			const [
				numVestingEntries,
				totalEscrowed,
				totalVested,
				unformattedTotalBalancePendingMigration,
			] = await Promise.all([
				RewardEscrowV2.numVestingEntries(walletAddress),
				RewardEscrowV2.balanceOf(walletAddress),
				RewardEscrowV2.totalVestedAccountBalance(walletAddress),
				RewardEscrowV2.totalBalancePendingMigration(walletAddress),
			]);

			const totalBalancePendingMigration = Number(
				formatEther(unformattedTotalBalancePendingMigration)
			);

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

			(vestingEntries ?? []).forEach(({ escrowAmount, entryID, endTime }: VestingEntry) => {
				const quantity = escrowAmount / 1e18;
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
				totalBalancePendingMigration,
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useEscrowDataQueryV2;
