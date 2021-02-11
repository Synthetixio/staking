import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';
import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';
import { Synths } from 'constants/currency';

import { LiquidityPoolData } from './types';

const useTSLAPoolQuery = (options?: QueryConfig<LiquidityPoolData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<LiquidityPoolData>(
		QUERY_KEYS.LiquidityPools.sTSLA(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { StakingRewardssTSLABalancer, ProxysTSLA, ExchangeRates },
			} = synthetix.js!;

			const { address } = StakingRewardssTSLABalancer;
			const getDuration =
				StakingRewardssTSLABalancer.DURATION || StakingRewardssTSLABalancer.rewardsDuration;

			const [
				duration,
				rate,
				periodFinish,
				sTslaLPBalance,
				sTslaLPUserBalance,
				sTslaLPPrice,
				sTslaSNXRewards,
				sTslaLPStaked,
				sTslaLPAllowance,
			] = await Promise.all([
				getDuration(),
				StakingRewardssTSLABalancer.rewardRate(),
				StakingRewardssTSLABalancer.periodFinish(),
				ProxysTSLA.balanceOf(address),
				ProxysTSLA.balanceOf(walletAddress),
				ExchangeRates.rateForCurrency(synthetix.js?.toBytes32(Synths.sTSLA)),
				StakingRewardssTSLABalancer.earned(walletAddress),
				StakingRewardssTSLABalancer.balanceOf(walletAddress),
				ProxysTSLA.allowance(walletAddress, address),
			]);
			const durationInWeeks = Number(duration) / 3600 / 24 / 7;
			const isPeriodFinished = new Date().getTime() > Number(periodFinish) * 1000;
			const distribution = isPeriodFinished
				? 0
				: Math.trunc(Number(duration) * (rate / 1e18)) / durationInWeeks;

			const [balance, userBalance, price, rewards, staked, allowance] = [
				sTslaLPBalance,
				sTslaLPUserBalance,
				sTslaLPPrice,
				sTslaSNXRewards,
				sTslaLPStaked,
				sTslaLPAllowance,
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
				stakedBN: sTslaLPStaked,
				allowance,
				userBalance,
				userBalanceBN: sTslaLPUserBalance,
				needsToSettle: false,
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useTSLAPoolQuery;
