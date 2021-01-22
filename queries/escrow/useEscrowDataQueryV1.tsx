import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { isLayerOneState } from 'store/chain';
import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { EscrowData, Schedule } from 'hooks/useEscrowDataQueryWrapper';

const useEscrowDataQueryV1 = (options?: QueryConfig<EscrowData>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);
	const isLayer1 = useRecoilValue(isLayerOneState);

	return useQuery<EscrowData>(
		QUERY_KEYS.Escrow.DataV1(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { RewardEscrow, RewardEscrowV2 },
				utils: { formatEther },
			} = synthetix.js!;
			const [
				accountSchedule,
				totalEscrowed,
				totalVested,
				unformattedTotalBalancePendingMigration,
			] = await Promise.all([
				RewardEscrow.checkAccountSchedule(walletAddress),
				RewardEscrow.totalEscrowedAccountBalance(walletAddress),
				RewardEscrow.totalVestedAccountBalance(walletAddress),
				RewardEscrowV2.totalBalancePendingMigration(walletAddress),
			]);

			const totalBalancePendingMigration = Number(
				formatEther(unformattedTotalBalancePendingMigration)
			);

			let schedule: Schedule = [];
			let claimableAmount: number = 0;
			const currentUnixTime = new Date().getTime();

			for (let i = 0; i < accountSchedule.length; i += 2) {
				const quantity = Number(formatEther(accountSchedule[i + 1]));

				if (!accountSchedule[i].isZero() && quantity) {
					if (accountSchedule[i] * 1000 < currentUnixTime) {
						claimableAmount += quantity;
					}
					schedule.push({
						date: new Date(Number(accountSchedule[i]) * 1000),
						quantity,
					});
				}
			}

			return {
				claimableAmount,
				schedule,
				totalEscrowed: totalEscrowed / 1e18,
				totalVested: totalVested / 1e18,
				totalBalancePendingMigration,
			};
		},
		{
			enabled: isAppReady && isWalletConnected && isLayer1,
			...options,
		}
	);
};

export default useEscrowDataQueryV1;
