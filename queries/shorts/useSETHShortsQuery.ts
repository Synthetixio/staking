import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';
import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import {
	walletAddressState,
	isWalletConnectedState,
	networkState,
	isMainnetState,
} from 'store/wallet';
import { Synths } from 'constants/currency';
import { ShortRewardsData } from './types';

const useSETHShortsQuery = (options?: UseQueryOptions<ShortRewardsData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isMainnet = useRecoilValue(isMainnetState);

	return useQuery<ShortRewardsData>(
		QUERY_KEYS.ShortRewards.sETH(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { CollateralManager, ExchangeRates, ShortingRewardssETH },
			} = synthetix.js!;

			const getDuration = ShortingRewardssETH.DURATION || ShortingRewardssETH.rewardsDuration;

			const [
				duration,
				rate,
				periodFinish,
				sEthSNXRewards,
				sEthStaked,
				openInterestBN,
				[assetUSDPriceBN],
			] = await Promise.all([
				getDuration(),
				ShortingRewardssETH.rewardRate(),
				ShortingRewardssETH.periodFinish(),
				ShortingRewardssETH.earned(walletAddress),
				ShortingRewardssETH.balanceOf(walletAddress),
				CollateralManager.short(synthetix.js?.toBytes32(Synths.sETH)),
				ExchangeRates.rateAndInvalid(synthetix.js?.toBytes32(Synths.sETH)),
			]);

			const durationInWeeks = Number(duration) / 3600 / 24 / 7;
			const isPeriodFinished = new Date().getTime() > Number(periodFinish) * 1000;
			const distribution = isPeriodFinished
				? 0
				: Math.trunc(Number(duration) * (rate / 1e18)) / durationInWeeks;

			const [openInterest, assetUSDPrice, rewards, staked] = [
				openInterestBN,
				assetUSDPriceBN,
				sEthSNXRewards,
				sEthStaked,
			].map((data) => Number(synthetix.js?.utils.formatEther(data)));

			const openInterestUSD = openInterest * assetUSDPrice;

			return {
				openInterestUSD: openInterestUSD,
				distribution: distribution,
				periodFinish: Number(periodFinish) * 1000,
				duration: Number(duration) * 1000,
				rewards,
				staked,
			};
		},
		{
			enabled: isAppReady && isWalletConnected && isMainnet,
			...options,
		}
	);
};

export default useSETHShortsQuery;
