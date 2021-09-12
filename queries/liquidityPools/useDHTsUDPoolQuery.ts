import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

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
import { wei } from '@synthetixio/wei';

const useDHTsUSDPoolQuery = (options?: UseQueryOptions<DualRewardsLiquidityPoolData>) => {
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
				a: isPeriodFinished ? wei(0) : wei(rateA).mul(duration).div(durationInWeeks),
				b: isPeriodFinished ? wei(0) : wei(rateB).mul(duration).div(durationInWeeks),
			};

			const rewards = {
				a: wei(SNXRewards),
				b: wei(DHTRewards),
			};

			const [balance, userBalance, staked, allowance] = [
				DHTsUSDLPBalance,
				DHTsUSDLPUserBalance,
				DHTsUSDLPStaked,
				DHTsUSDLPAllowance,
			].map((data) => wei(data));

			return {
				distribution,
				address,
				balance,
				periodFinish: Number(periodFinish) * 1000,
				rewards,
				staked,
				duration: Number(duration) * 1000,
				allowance,
				userBalance,
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
