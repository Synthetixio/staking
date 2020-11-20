import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';

export type EscrowData = {
	canVest: number;
	schedule: Array<{
		date: Date;
		quantity: number;
	}>;
	totalEscrowed: number;
	totalVested: number;
};

const useEscrowDataQuery = (options?: QueryConfig<EscrowData>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<EscrowData>(
		QUERY_KEYS.Escrow.Data(walletAddress ?? '', network?.id!),
		async () => {
			const [accountSchedule, totalEscrowed, totalVested] = await Promise.all([
				synthetix.js?.contracts.RewardEscrow.checkAccountSchedule(walletAddress),
				synthetix.js?.contracts.RewardEscrow.totalEscrowedAccountBalance(walletAddress),
				synthetix.js?.contracts.RewardEscrow.totalVestedAccountBalance(walletAddress),
			]);

			const schedule = [];
			let canVest = 0;
			const currentUnixTime = new Date().getTime();

			for (let i = 0; i < accountSchedule.length; i += 2) {
				const quantity = Number(synthetix.js?.utils.formatEther(accountSchedule[i + 1]));

				if (!accountSchedule[i].isZero() && quantity) {
					if (accountSchedule[i] * 1000 < currentUnixTime) {
						canVest += quantity;
					}
					schedule.push({
						date: new Date(Number(accountSchedule[i]) * 1000),
						quantity,
					});
				}
			}

			return {
				canVest,
				schedule,
				totalEscrowed: Number(synthetix.js?.utils.formatEther(totalEscrowed)),
				totalVested: Number(synthetix.js?.utils.formatEther(totalVested)),
			};
		},
		{
			enabled: synthetix.js && isWalletConnected,
			...options,
		}
	);
};

export default useEscrowDataQuery;
