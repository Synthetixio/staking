import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import axios from 'axios';

import synthetix from 'lib/synthetix';
import Connector from 'containers/Connector';
import {
	curveGaugeController,
	curveSusdGauge,
	curveSusdPool,
	curveSusdPoolToken,
	curveSusdRewards,
} from 'contracts';
import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';

import { LiquidityPoolData } from './types';
import { getCurveTokenPrice } from './helper';

export type CurveData = LiquidityPoolData & {
	swapAPR: number;
	rewardsAPR: number;
};

const useCurveSusdPoolQuery = (options?: QueryConfig<CurveData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const { provider } = Connector.useContainer();

	return useQuery<CurveData>(
		QUERY_KEYS.LiquidityPools.sUSD(walletAddress ?? '', network?.id!),
		async () => {
			const contract = new ethers.Contract(
				curveSusdRewards.address,
				curveSusdRewards.abi,
				provider as ethers.providers.Provider
			);
			const curveSusdPoolContract = new ethers.Contract(
				curveSusdPool.address,
				// @ts-ignore
				curveSusdPool.abi,
				provider as ethers.providers.Provider
			);
			const curveSusdPoolTokenContract = new ethers.Contract(
				curveSusdPoolToken.address,
				// @ts-ignore
				curveSusdPoolToken.abi,
				provider as ethers.providers.Provider
			);
			const curveSusdGaugeContract = new ethers.Contract(
				curveSusdGauge.address,
				// @ts-ignore
				curveSusdGauge.abi,
				provider as ethers.providers.Provider
			);
			const curveGaugeControllerContract = new ethers.Contract(
				curveGaugeController.address,
				// @ts-ignore
				curveGaugeController.abi,
				provider as ethers.providers.Provider
			);

			const address = contract.address;
			const getDuration = contract.DURATION || contract.rewardsDuration;

			const curveTokenPrice = getCurveTokenPrice();

			const [
				duration,
				rate,
				periodFinish,
				curveSusdBalance,
				curveSusdUserBalance,
				curveSusdTokenPrice,
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
				curveSusdPoolTokenContract.balanceOf(address),
				curveSusdPoolTokenContract.balanceOf(walletAddress),
				curveSusdPoolContract.get_virtual_price(),
				curveSusdGaugeContract.inflation_rate(),
				curveSusdGaugeContract.working_supply(),
				curveGaugeControllerContract.gauge_relative_weight(curveSusdGauge.address),
				curveTokenPrice,
				axios.get('https://www.curve.fi/raw-stats/apys.json'),
				contract.earned(walletAddress),
				contract.balanceOf(walletAddress),
				curveSusdPoolTokenContract.allowance(walletAddress, address),
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
				curveSusdBalance,
				curveSusdUserBalance,
				curveSusdTokenPrice,
				curveInflationRate,
				curveWorkingSupply,
				gaugeRelativeWeight,
				curveRewards,
				curveStaked,
				curveAllowance,
			].map((data) => Number(synthetix.js?.utils.formatEther(data)));

			const curveRate =
				(((inflationRate * relativeWeight * 31536000) / workingSupply) * 0.4) / curveSusdTokenPrice;
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

export default useCurveSusdPoolQuery;
