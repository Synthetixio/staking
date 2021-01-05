import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';
import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';
import { Synths } from 'constants/currency';

import { LiquidityPoolData } from './types';

const useIETHPoolQuery_1 = (options?: QueryConfig<LiquidityPoolData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<LiquidityPoolData>(
		QUERY_KEYS.LiquidityPools.iETH(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { StakingRewardsiETH, Exchanger, ProxyiETH, ExchangeRates },
				utils: { formatBytes32String },
			} = synthetix.js!;

			const address = StakingRewardsiETH.address;

			const getDuration = StakingRewardsiETH.DURATION || StakingRewardsiETH.rewardsDuration;
			const [
				duration,
				rate,
				periodFinish,
				iEthBalance,
				iEthUserBalance,
				iEthPrice,
				iEthSNXRewards,
				iEthStaked,
				iETHAllowance,
				settlementOwing,
			] = await Promise.all([
				getDuration(),
				StakingRewardsiETH.rewardRate(),
				StakingRewardsiETH.periodFinish(),
				ProxyiETH.balanceOf(address),
				ProxyiETH.balanceOf(walletAddress),
				ExchangeRates.rateForCurrency(synthetix.js?.toBytes32(Synths.iETH)),
				StakingRewardsiETH.earned(walletAddress),
				StakingRewardsiETH.balanceOf(walletAddress),
				ProxyiETH.allowance(walletAddress, address),
				Exchanger.settlementOwing(walletAddress, formatBytes32String('iETH')),
			]);
			const durationInWeeks = Number(duration) / 3600 / 24 / 7;
			const isPeriodFinished = new Date().getTime() > Number(periodFinish) * 1000;
			const distribution = isPeriodFinished
				? 0
				: Math.trunc(Number(duration) * (rate / 1e18)) / durationInWeeks;

			const reclaimAmount = Number(settlementOwing.reclaimAmount);
			const rebateAmount = Number(settlementOwing.rebateAmount);

			const [balance, userBalance, price, rewards, staked, allowance] = [
				iEthBalance,
				iEthUserBalance,
				iEthPrice,
				iEthSNXRewards,
				iEthStaked,
				iETHAllowance,
			].map((data) => Number(synthetix.js?.utils.formatEther(data)));

			return {
				distribution,
				address,
				price,
				balance,
				periodFinish: Number(periodFinish) * 1000,
				rewards,
				staked,
				duration: Number(duration) * 1000,
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

export default useIETHPoolQuery_1;
