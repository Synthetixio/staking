import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import axios from 'axios';

import Connector from 'containers/Connector';
import {
	curveGaugeController,
	curveSeuroGauge,
	curveSeuroPool,
	curveSeuroPoolToken,
	curveSeuroRewards,
} from 'contracts';
import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import {
	walletAddressState,
	isWalletConnectedState,
	networkState,
	isMainnetState,
} from 'store/wallet';
import { toBigNumber } from 'utils/formatters/number';

import { LiquidityPoolData } from './types';
import { getCurveTokenPrice } from './helper';

export type CurveData = LiquidityPoolData & {
	swapAPR: number;
	rewardsAPR: number;
};

const useCurveSeuroPoolQuery = (options?: QueryConfig<CurveData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const { provider } = Connector.useContainer();
	const isMainnet = useRecoilValue(isMainnetState);

	return useQuery<CurveData>(
		QUERY_KEYS.LiquidityPools.sEUR(walletAddress ?? '', network?.id!),
		async () => {
			const contract = new ethers.Contract(
				curveSeuroRewards.address,
				curveSeuroRewards.abi,
				provider as ethers.providers.Provider
			);
			const curveSeuroPoolContract = new ethers.Contract(
				curveSeuroPool.address,
				// @ts-ignore
				curveSeuroPool.abi,
				provider as ethers.providers.Provider
			);
			const curveSeuroPoolTokenContract = new ethers.Contract(
				curveSeuroPoolToken.address,
				// @ts-ignore
				curveSeuroPoolToken.abi,
				provider as ethers.providers.Provider
			);
			const curveSeuroGaugeContract = new ethers.Contract(
				curveSeuroGauge.address,
				// @ts-ignore
				curveSeuroGauge.abi,
				provider as ethers.providers.Provider
			);
			const curveGaugeControllerContract = new ethers.Contract(
				curveGaugeController.address,
				// @ts-ignore
				curveGaugeController.abi,
				provider as ethers.providers.Provider
			);

			const curveSeuroGaugeContractWeb3 = makeWeb3Contract(
				curveSeuroGauge.address,
				curveSeuroGauge.abi
			);

			const address = contract.address;
			const getDuration = contract.DURATION || contract.rewardsDuration;

			const curveTokenPrice = getCurveTokenPrice();

			const [
				duration,
				rate,
				periodFinish,
				curveSeuroBalance,
				curveSeuroUserBalance,
				curveSeuroTokenPrice,
				curveInflationRate,
				curveWorkingSupply,
				gaugeRelativeWeight,
				curvePrice,
				swapData,
				curveRewards,
				curveStaked,
				curveAllowance,
			] = await Promise.all([
				getDuration(),
				contract.rewardRate(),
				contract.periodFinish(),
				curveSeuroPoolTokenContract.balanceOf(address),
				curveSeuroPoolTokenContract.balanceOf(walletAddress),
				curveSeuroPoolContract.get_virtual_price(),
				curveSeuroGaugeContract.inflation_rate({ gasLimit: 1e5 }),
				curveSeuroGaugeContract.working_supply({ gasLimit: 1e5 }),
				curveGaugeControllerContract.gauge_relative_weight(curveSeuroGauge.address),
				curveTokenPrice,
				axios.get('https://stats.curve.fi/raw-stats/apys.json'),
				contract.earned(walletAddress),
				curveSeuroGaugeContract.balanceOf(walletAddress),
				curveSeuroPoolTokenContract.allowance(walletAddress, address),
			]);
			const durationInWeeks = Number(duration) / 3600 / 24 / 7;
			const isPeriodFinished = new Date().getTime() > Number(periodFinish) * 1000;
			const distribution = isPeriodFinished
				? 0
				: Math.trunc(Number(duration) * (rate / 1e18)) / durationInWeeks;

			const [
				balance,
				userBalance,
				price,
				inflationRate,
				workingSupply,
				relativeWeight,
				rewards,
				staked,
				allowance,
			] = [
				curveSeuroBalance,
				curveSeuroUserBalance,
				curveSeuroTokenPrice,
				curveInflationRate,
				curveWorkingSupply,
				gaugeRelativeWeight,
				curveRewards,
				curveStaked,
				curveAllowance,
			].map((data) => Number(toBigNumber(data.toString()).div(1e18)));

			const curveRate =
				(((inflationRate * relativeWeight * 31536000) / workingSupply) * 0.4) /
				curveSeuroTokenPrice;
			const rewardsAPR = curveRate * curvePrice * 1e18;
			const swapAPR = swapData?.data?.apy?.day?.susd ?? 0;

			return {
				periodFinish: Number(periodFinish) * 1000,
				distribution,
				address,
				price,
				balance,
				swapAPR,
				rewardsAPR,
				rewards,
				staked,
				stakedBN: curveStaked,
				duration: Number(duration) * 1000,
				allowance,
				userBalance,
				userBalanceBN: curveSeuroUserBalance,
			};
		},
		{
			enabled: isAppReady && isWalletConnected && provider != null && isMainnet,
			...options,
		}
	);
};

export default useCurveSeuroPoolQuery;
