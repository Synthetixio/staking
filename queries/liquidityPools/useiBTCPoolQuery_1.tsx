import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';
import Connector from 'containers/Connector';
import { iBtcRewards } from 'contracts';
import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';
import { SYNTHS_MAP } from 'constants/currency';

import { LiquidityPoolData } from './types';

const useiBTCPoolQuery_1 = (options?: QueryConfig<LiquidityPoolData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const { provider } = Connector.useContainer();

	return useQuery<LiquidityPoolData>(
		QUERY_KEYS.LiquidityPools.iBTC(walletAddress ?? '', network?.id!),
		async () => {
			const contract = new ethers.Contract(
				iBtcRewards.address,
				iBtcRewards.abi,
				provider as ethers.providers.Provider
			);
			const address = contract.address;

			const getDuration = contract.DURATION || contract.rewardsDuration;
			const [duration, rate, periodFinish, iBtcBalance, iBtcPrice] = await Promise.all([
				getDuration(),
				contract.rewardRate(),
				contract.periodFinish(),
				synthetix.js?.contracts.ProxyiBTC.balanceOf(address),
				synthetix.js?.contracts.ExchangeRates.rateForCurrency(
					synthetix.js?.toBytes32(SYNTHS_MAP.iBTC)
				),
			]);
			const durationInWeeks = Number(duration) / 3600 / 24 / 7;
			const isPeriodFinished = new Date().getTime() > Number(periodFinish) * 1000;
			const distribution = isPeriodFinished
				? 0
				: Math.trunc(Number(duration) * (rate / 1e18)) / durationInWeeks;

			const [balance, price] = [iBtcBalance, iBtcPrice].map((data) =>
				Number(synthetix.js?.utils.formatEther(data))
			);

			return {
				distribution,
				address,
				price,
				balance,
				periodFinish: Number(periodFinish) * 1000,
			};
		},
		{
			enabled: synthetix.js && isAppReady && isWalletConnected && provider != null,
			...options,
		}
	);
};

export default useiBTCPoolQuery_1;
