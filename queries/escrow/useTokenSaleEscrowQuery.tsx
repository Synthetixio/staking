import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';

export type TokenSaleEscrow = {
	escrowPeriod: number;
	totalEscrowed: number;
	releaseIntervalMonths: number;
	totalPeriod: number;
	claimableAmount: number;
	schedule: Schedule;
	totalVested: number;
};

type Schedule = Array<
	| {
			quantity: number;
			date: Date;
	  }
	| []
>;

const useTokenSaleEscrowQuery = (options?: UseQueryOptions<TokenSaleEscrow | null>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<TokenSaleEscrow | null>(
		QUERY_KEYS.Escrow.TokenSale(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { EscrowChecker, SynthetixEscrow },
				utils: { formatEther },
			} = synthetix.js!;
			const [accountSchedule, totalEscrowed] = await Promise.all([
				EscrowChecker.checkAccountSchedule(walletAddress),
				SynthetixEscrow.balanceOf(walletAddress),
			]);
			const currentUnixTime = new Date().getTime();
			const vestStartTime = 1520899200;
			const monthInSeconds = 2592000;
			const dataReversed = accountSchedule.slice().reverse();
			let totalPeriod = 0;
			let hasVesting = false;
			let lastVestTime;
			let schedule: Schedule = [];
			let claimableAmount = 0;
			let totalVested;

			for (let i = 0; i < dataReversed.length - 1; i += 2) {
				const parsedQuantity = Number(formatEther(dataReversed[i]));
				const parsedDate = parseInt(dataReversed[i + 1]) * 1000;

				if (parsedDate !== 0) {
					hasVesting = true;
					totalPeriod++;
				}

				if (parsedDate === 0 && hasVesting) {
					totalPeriod++;
				}

				if (parsedDate !== 0 && !lastVestTime) {
					lastVestTime = dataReversed[i + 1];
				}

				if (parsedDate > 0 && parsedDate < currentUnixTime) {
					claimableAmount += parsedQuantity;
				}

				if (lastVestTime) {
					totalVested = totalVested ? totalVested.add(dataReversed[i]) : dataReversed[i];
					schedule.push({ date: new Date(parsedDate), quantity: parsedQuantity });
				}
			}

			const escrowPeriod = (lastVestTime - vestStartTime) / monthInSeconds;
			const releaseIntervalMonths = escrowPeriod / totalPeriod;
			return hasVesting
				? {
						escrowPeriod,
						releaseIntervalMonths,
						totalPeriod,
						claimableAmount,
						schedule,
						totalEscrowed: totalEscrowed / 1e18,
						totalVested: Number(formatEther(totalVested)),
				  }
				: null;
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useTokenSaleEscrowQuery;
