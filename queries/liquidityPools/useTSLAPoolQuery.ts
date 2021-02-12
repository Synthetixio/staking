import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';

import synthetix from 'lib/synthetix';
import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';
import Connector from 'containers/Connector';

import { LiquidityPoolData } from './types';
import { balancersTSLAPoolToken } from 'contracts';
import { getsTSLABalancerPool } from './helper';

const useTSLAPoolQuery = (options?: QueryConfig<LiquidityPoolData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const { provider } = Connector.useContainer();

	return useQuery<LiquidityPoolData>(
		QUERY_KEYS.LiquidityPools.sTSLA(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { StakingRewardssTSLABalancer },
			} = synthetix.js!;

			const sTSLABPTokenPrice = getsTSLABalancerPool();

			const sTSLABalancerContract = new ethers.Contract(
				balancersTSLAPoolToken.address,
				balancersTSLAPoolToken.abi,
				provider as ethers.providers.Provider
			);

			const { address } = StakingRewardssTSLABalancer;
			const getDuration =
				StakingRewardssTSLABalancer.DURATION || StakingRewardssTSLABalancer.rewardsDuration;

			const [
				duration,
				rate,
				periodFinish,
				sTslaLPBalance,
				sTslaLPUserBalance,
				price,
				sTslaSNXRewards,
				sTslaLPStaked,
				sTslaLPAllowance,
			] = await Promise.all([
				getDuration(),
				StakingRewardssTSLABalancer.rewardRate(),
				StakingRewardssTSLABalancer.periodFinish(),
				sTSLABalancerContract.balanceOf(address),
				sTSLABalancerContract.balanceOf(walletAddress),
				sTSLABPTokenPrice,
				StakingRewardssTSLABalancer.earned(walletAddress),
				StakingRewardssTSLABalancer.balanceOf(walletAddress),
				sTSLABalancerContract.allowance(walletAddress, address),
			]);
			const durationInWeeks = Number(duration) / 3600 / 24 / 7;
			const isPeriodFinished = new Date().getTime() > Number(periodFinish) * 1000;
			const distribution = isPeriodFinished
				? 0
				: Math.trunc(Number(duration) * (rate / 1e18)) / durationInWeeks;

			const [balance, userBalance, rewards, staked, allowance] = [
				sTslaLPBalance,
				sTslaLPUserBalance,
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
