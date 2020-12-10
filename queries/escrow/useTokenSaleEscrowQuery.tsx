import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';

export type TokenSaleEscrow = {
	escrowPeriod: number;
	releaseIntervalMonths: number;
	totalPeriod: number;
	availableTokensForVesting: number;
	data: {
		time: number;
		value: number;
	}[];
	totalVesting: number;
};

const useTokenSaleEscrowQuery = (options?: QueryConfig<TokenSaleEscrow | null>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<TokenSaleEscrow | null>(
		QUERY_KEYS.Escrow.TokenSale(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { EscrowChecker },
				utils: { formatEther },
			} = synthetix.js!;
			const data = await EscrowChecker.checkAccountSchedule(walletAddress);
			const currentUnixTime = new Date().getTime();
			const vestStartTime = 1520899200;
			const monthInSeconds = 2592000;
			const dataReversed = data.slice().reverse();
			let totalPeriod = 0;
			let hasVesting = false;
			let lastVestTime;
			let groupedData = [];
			let availableTokensForVesting = 0;
			let totalVesting;

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
					availableTokensForVesting += parsedQuantity;
				}

				if (lastVestTime) {
					totalVesting = totalVesting ? totalVesting.add(dataReversed[i]) : dataReversed[i];
					groupedData.push({ time: parsedDate, value: parsedQuantity });
				}
			}

			const escrowPeriod = (lastVestTime - vestStartTime) / monthInSeconds;
			const releaseIntervalMonths = escrowPeriod / totalPeriod;
			return hasVesting
				? {
						escrowPeriod,
						releaseIntervalMonths,
						totalPeriod,
						availableTokensForVesting,
						data: groupedData,
						totalVesting: Number(formatEther(totalVesting)),
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
