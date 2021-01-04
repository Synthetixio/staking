import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';
import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';
import { Synths } from 'constants/currency';

import { LiquidityPoolData } from './types';

const useIBTCPoolQuery_1 = (options?: QueryConfig<LiquidityPoolData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<LiquidityPoolData>(
		QUERY_KEYS.LiquidityPools.iBTC(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { StakingRewardsiBTC, Exchanger, ProxyiBTC, ExchangeRates },
				utils: { formatBytes32String },
			} = synthetix.js!;

			const address = StakingRewardsiBTC.address;

			const getDuration = StakingRewardsiBTC.DURATION || StakingRewardsiBTC.rewardsDuration;
			const [
				duration,
				rate,
				periodFinish,
				iBtcBalance,
				iBtcUserBalance,
				iBtcPrice,
				iBtcSNXRewards,
				iBtcStaked,
				iBtcAllowance,
				settlementOwing,
			] = await Promise.all([
				getDuration(),
				StakingRewardsiBTC.rewardRate(),
				StakingRewardsiBTC.periodFinish(),
				ProxyiBTC.balanceOf(address),
				ProxyiBTC.balanceOf(walletAddress),
				ExchangeRates.rateForCurrency(synthetix.js?.toBytes32(Synths.iBTC)),
				StakingRewardsiBTC.earned(walletAddress),
				StakingRewardsiBTC.balanceOf(walletAddress),
				ProxyiBTC.allowance(walletAddress, address),
				Exchanger.settlementOwing(walletAddress, formatBytes32String('iBTC')),
			]);
			const durationInWeeks = Number(duration) / 3600 / 24 / 7;
			const isPeriodFinished = new Date().getTime() > Number(periodFinish) * 1000;
			const distribution = isPeriodFinished
				? 0
				: Math.trunc(Number(duration) * (rate / 1e18)) / durationInWeeks;

			const reclaimAmount = Number(settlementOwing.reclaimAmount);
			const rebateAmount = Number(settlementOwing.rebateAmount);

			const [balance, userBalance, price, rewards, staked, allowance] = [
				iBtcBalance,
				iBtcUserBalance,
				iBtcPrice,
				iBtcSNXRewards,
				iBtcStaked,
				iBtcAllowance,
			].map((data) => Number(synthetix.js?.utils.formatEther(data)));

			return {
				distribution,
				address,
				price,
				balance,
				periodFinish: Number(periodFinish) * 1000,
				duration: Number(duration) * 1000,
				rewards,
				staked,
				allowance,
				userBalance,
				needsToSettle: reclaimAmount || rebateAmount ? true : false,
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useIBTCPoolQuery_1;
