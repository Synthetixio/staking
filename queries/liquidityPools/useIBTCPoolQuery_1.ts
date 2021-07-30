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

const useIBTCPoolQuery_1 = (options?: UseQueryOptions<LiquidityPoolData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isMainnet = useRecoilValue(isMainnetState);

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
				Exchanger.settlementOwing(walletAddress, formatBytes32String(Synths.iBTC)),
			]);
			const durationInWeeks = Number(duration) / 3600 / 24 / 7;
			const isPeriodFinished = new Date().getTime() > Number(periodFinish) * 1000;
			const distribution = isPeriodFinished ? wei(0) : rate.mul(duration).div(durationInWeeks);

			const reclaimAmount = Number(settlementOwing.reclaimAmount);
			const rebateAmount = Number(settlementOwing.rebateAmount);

			const [balance, userBalance, price, rewards, staked, allowance] = [
				iBtcBalance,
				iBtcUserBalance,
				iBtcPrice,
				iBtcSNXRewards,
				iBtcStaked,
				iBtcAllowance,
			].map((data) => wei(data));

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
			enabled: isAppReady && isWalletConnected && isMainnet,
			...options,
		}
	);
};

export default useIBTCPoolQuery_1;
