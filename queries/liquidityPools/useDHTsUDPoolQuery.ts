import { useQuery, QueryConfig } from 'react-query';
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
import { dualStakingRewards, DHTsUSDLPToken as lpToken } from 'contracts';

import { DualRewardsLiquidityPoolData } from './types';
import { ethers } from 'ethers';
import Connector from 'containers/Connector';
import { getDHTPrice, getUniswapPairLiquidity } from './helper';

const useDHTsUSDPoolQuery = (options?: QueryConfig<DualRewardsLiquidityPoolData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const { provider } = Connector.useContainer();
	const isMainnet = useRecoilValue(isMainnetState);

	return useQuery<DualRewardsLiquidityPoolData>(
		QUERY_KEYS.LiquidityPools.DHTsUSD(walletAddress ?? '', network?.id!),
		async () => {
			const StakingDualRewards = new ethers.Contract(
				dualStakingRewards.address,
				dualStakingRewards.abi,
				provider as ethers.providers.Provider
			);
			const DHTsUSDLPToken = new ethers.Contract(
				lpToken.address,
				lpToken.abi,
				provider as ethers.providers.Provider
			);
			const {
				utils: { formatEther },
			} = synthetix.js!;

			const address = StakingDualRewards.address;

			const [
				duration,
				rateA,
				rateB,
				periodFinish,
				DHTsUSDLPBalance,
				DHTsUSDLPUserBalance,
				SNXRewards,
				DHTRewards,
				DHTsUSDLPStaked,
				DHTsUSDLPAllowance,
				DHTprice,
				liquidity,
			] = await Promise.all([
				StakingDualRewards.rewardsDuration(),
				StakingDualRewards.rewardRateB(),
				StakingDualRewards.rewardRateA(),
				StakingDualRewards.periodFinish(),
				DHTsUSDLPToken.balanceOf(address),
				DHTsUSDLPToken.balanceOf(walletAddress),
				StakingDualRewards.earnedB(walletAddress),
				StakingDualRewards.earnedA(walletAddress),
				StakingDualRewards.balanceOf(walletAddress),
				DHTsUSDLPToken.allowance(walletAddress, address),
				getDHTPrice(),
				getUniswapPairLiquidity(),
			]);

			const durationInWeeks = Number(duration) / 3600 / 24 / 7;
			const isPeriodFinished = new Date().getTime() > Number(periodFinish) * 1000;
			const distribution = {
				a: isPeriodFinished ? 0 : Math.trunc(Number(duration) * (rateA / 1e18)) / durationInWeeks,
				b: isPeriodFinished ? 0 : Math.trunc(Number(duration) * (rateB / 1e18)) / durationInWeeks,
			};

			const rewards = {
				a: Number(formatEther(SNXRewards)),
				b: Number(formatEther(DHTRewards)),
			};

			const [balance, userBalance, staked, allowance] = [
				DHTsUSDLPBalance,
				DHTsUSDLPUserBalance,
				DHTsUSDLPStaked,
				DHTsUSDLPAllowance,
			].map((data) => Number(synthetix.js?.utils.formatEther(data)));

			return {
				distribution,
				address,
				balance,
				periodFinish: Number(periodFinish) * 1000,
				rewards,
				staked,
				stakedBN: DHTsUSDLPStaked,
				duration: Number(duration) * 1000,
				allowance,
				userBalance,
				userBalanceBN: DHTsUSDLPUserBalance,
				price: DHTprice,
				liquidity,
			};
		},
		{
			enabled: isAppReady && isWalletConnected && isMainnet,
			...options,
		}
	);
};

export default useDHTsUSDPoolQuery;
