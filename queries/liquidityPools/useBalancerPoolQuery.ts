import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';

import synthetix from 'lib/synthetix';
import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import {
	walletAddressState,
	isWalletConnectedState,
	networkState,
	isMainnetState,
} from 'store/wallet';
import Connector from 'containers/Connector';

import { LiquidityPoolData } from './types';
import { getBalancerPool } from './helper';
import { Synths } from 'constants/currency';

type BalancerPoolTokenContract = {
	address: string;
	abi: any[];
};

const useBalancerPoolQuery = (
	synth: Synths,
	rewardsContractName: string,
	balancerPoolTokenContract: BalancerPoolTokenContract,
	options?: QueryConfig<LiquidityPoolData>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const { provider } = Connector.useContainer();
	const isMainnet = useRecoilValue(isMainnetState);

	return useQuery<LiquidityPoolData>(
		QUERY_KEYS.LiquidityPools.Balancer(walletAddress ?? '', synth, network?.id!),
		async () => {
			const {
				contracts: { [rewardsContractName]: StakingRewardsContract },
			} = synthetix.js!;

			const BPTokenPrice = getBalancerPool(balancerPoolTokenContract.address);

			const BalancerContract = new ethers.Contract(
				balancerPoolTokenContract.address,
				balancerPoolTokenContract.abi,
				provider as ethers.providers.Provider
			);

			const { address } = StakingRewardsContract;
			const getDuration = StakingRewardsContract.DURATION || StakingRewardsContract.rewardsDuration;

			const [
				duration,
				rate,
				periodFinish,
				LPBalance,
				LPUserBalance,
				price,
				SNXRewards,
				LPStaked,
				LPAllowance,
			] = await Promise.all([
				getDuration(),
				StakingRewardsContract.rewardRate(),
				StakingRewardsContract.periodFinish(),
				BalancerContract.balanceOf(address),
				BalancerContract.balanceOf(walletAddress),
				BPTokenPrice,
				StakingRewardsContract.earned(walletAddress),
				StakingRewardsContract.balanceOf(walletAddress),
				BalancerContract.allowance(walletAddress, address),
			]);
			const durationInWeeks = Number(duration) / 3600 / 24 / 7;
			const isPeriodFinished = new Date().getTime() > Number(periodFinish) * 1000;
			const distribution = isPeriodFinished
				? 0
				: Math.trunc(Number(duration) * (rate / 1e18)) / durationInWeeks;

			const [balance, userBalance, rewards, staked, allowance] = [
				LPBalance,
				LPUserBalance,
				SNXRewards,
				LPStaked,
				LPAllowance,
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
				stakedBN: LPStaked,
				allowance,
				userBalance,
				userBalanceBN: LPUserBalance,
				needsToSettle: false,
			};
		},
		{
			enabled: isAppReady && isWalletConnected && isMainnet,
			...options,
		}
	);
};

export default useBalancerPoolQuery;
