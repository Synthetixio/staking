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

import { LiquidityPoolData } from './types';
import { wei } from '@synthetixio/wei';

const useIETHPoolQuery_1 = (options?: UseQueryOptions<LiquidityPoolData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isMainnet = useRecoilValue(isMainnetState);

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
			const distribution = isPeriodFinished ? wei(0) : rate.mul(duration).div(durationInWeeks);

			const reclaimAmount = Number(settlementOwing.reclaimAmount);
			const rebateAmount = Number(settlementOwing.rebateAmount);

			const [balance, userBalance, price, rewards, staked, allowance] = [
				iEthBalance,
				iEthUserBalance,
				iEthPrice,
				iEthSNXRewards,
				iEthStaked,
				iETHAllowance,
			].map((data) => wei(data));

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
			enabled: isAppReady && isWalletConnected && isMainnet,
			...options,
		}
	);
};

export default useIETHPoolQuery_1;
