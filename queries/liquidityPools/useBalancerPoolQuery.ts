import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';

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
import { wei } from '@synthetixio/wei';

type BalancerPoolTokenContract = {
	address: string;
	abi: any[];
};

const useBalancerPoolQuery = (
	synth: Synths,
	rewardsContractName: string,
	balancerPoolTokenContract: BalancerPoolTokenContract,
	options?: UseQueryOptions<LiquidityPoolData>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const { provider, synthetixjs } = Connector.useContainer();
	const isMainnet = useRecoilValue(isMainnetState);

	return useQuery<LiquidityPoolData>(
		QUERY_KEYS.LiquidityPools.Balancer(walletAddress ?? '', synth, network?.id!),
		async () => {
			const {
				contracts: { [rewardsContractName]: StakingRewardsContract },
			} = synthetixjs!;

			const BPTokenPrice = getBalancerPool(balancerPoolTokenContract.address);

			const BalancerContract = new ethers.Contract(
				balancerPoolTokenContract.address,
				balancerPoolTokenContract.abi,
				provider as ethers.providers.Provider
			);

			const { address } = StakingRewardsContract;
			const getDuration = StakingRewardsContract.DURATION || StakingRewardsContract.rewardsDuration;

			const [
				rawDuration,
				rate,
				rawPeriodFinish,
				balance,
				userBalance,
				price,
				rewards,
				staked,
				allowance,
			] = (
				await Promise.all([
					getDuration(),
					StakingRewardsContract.rewardRate(),
					StakingRewardsContract.periodFinish(),
					BalancerContract.balanceOf(address),
					BalancerContract.balanceOf(walletAddress),
					BPTokenPrice,
					StakingRewardsContract.earned(walletAddress),
					StakingRewardsContract.balanceOf(walletAddress),
					BalancerContract.allowance(walletAddress, address),
				])
			).map((data) => wei(data));

			const duration = rawDuration.toNumber(true);
			const periodFinish = rawPeriodFinish.toNumber(true);

			const durationInWeeks = duration / (3600 * 24 * 7);
			const isPeriodFinished = new Date().getTime() > periodFinish * 1000;
			const distribution = isPeriodFinished ? wei(0) : rate.mul(duration).div(durationInWeeks);

			return {
				distribution,
				address,
				price,
				balance,
				periodFinish: periodFinish * 1000,
				duration: duration * 1000,
				rewards,
				staked,
				allowance,
				userBalance,
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
