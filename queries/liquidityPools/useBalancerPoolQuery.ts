import { useQuery, UseQueryOptions } from 'react-query';
import { ethers } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';
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
  const {
    isAppReady,
    isWalletConnected,
    walletAddress,
    network,
    provider,
    synthetixjs,
    isMainnet,
  } = Connector.useContainer();

  return useQuery<LiquidityPoolData>(
    QUERY_KEYS.LiquidityPools.Balancer(walletAddress ?? '', synth, network?.id!),
    async () => {
      if (!synthetixjs) throw Error('Expected synthetixjs do be defined');

      const {
        contracts: { [rewardsContractName]: StakingRewardsContract },
      } = synthetixjs;

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
      enabled: Boolean(isAppReady && isWalletConnected && isMainnet && synthetixjs),
      ...options,
    }
  );
};

export default useBalancerPoolQuery;
