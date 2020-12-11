import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';
import Connector from 'containers/Connector';
import { iEthRewards } from 'contracts';
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
	const { provider } = Connector.useContainer();

	return useQuery<LiquidityPoolData>(
		QUERY_KEYS.LiquidityPools.iETH(walletAddress ?? '', network?.id!),
		async () => {
			const contract = new ethers.Contract(
				iEthRewards.address,
				iEthRewards.abi,
				provider as ethers.providers.Provider
			);
			const address = contract.address;

			const getDuration = contract.DURATION || contract.rewardsDuration;
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
			] = await Promise.all([
				getDuration(),
				contract.rewardRate(),
				contract.periodFinish(),
				synthetix.js?.contracts.ProxyiETH.balanceOf(address),
				synthetix.js?.contracts.ProxyiETH.balanceOf(walletAddress),
				synthetix.js?.contracts.ExchangeRates.rateForCurrency(synthetix.js?.toBytes32(Synths.iETH)),
				contract.earned(walletAddress),
				contract.balanceOf(walletAddress),
				synthetix.js?.contracts.ProxyiETH.allowance(walletAddress, address),
			]);
			const durationInWeeks = Number(duration) / 3600 / 24 / 7;
			const isPeriodFinished = new Date().getTime() > Number(periodFinish) * 1000;
			const distribution = isPeriodFinished
				? 0
				: Math.trunc(Number(duration) * (rate / 1e18)) / durationInWeeks;

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
			};
		},
		{
			enabled: isAppReady && isWalletConnected && provider != null,
			...options,
		}
	);
};

export default useIETHPoolQuery_1;
