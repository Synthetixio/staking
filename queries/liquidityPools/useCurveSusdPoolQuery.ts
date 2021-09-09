import { useQuery, UseQueryOptions } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import axios from 'axios';

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
import {
	walletAddressState,
	isWalletConnectedState,
	networkState,
	isMainnetState,
} from 'store/wallet';

import { LiquidityPoolData } from './types';
import { getCurveTokenPrice } from './helper';
import Wei, { wei } from '@synthetixio/wei';

export type CurveData = LiquidityPoolData & {
	swapAPR: Wei;
	rewardsAPR: Wei;
};

const useCurveSusdPoolQuery = (options?: UseQueryOptions<CurveData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const { provider } = Connector.useContainer();
	const isMainnet = useRecoilValue(isMainnetState);

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
				curveSusdGaugeContract.inflation_rate({ gasLimit: 1e5 }),
				curveSusdGaugeContract.working_supply({ gasLimit: 1e5 }),
				curveGaugeControllerContract.gauge_relative_weight(curveSusdGauge.address),
				curveTokenPrice,
				axios.get('https://stats.curve.fi/raw-stats/apys.json'),
				contract.earned(walletAddress),
				curveSusdGaugeContract.balanceOf(walletAddress),
				curveSusdPoolTokenContract.allowance(walletAddress, address),
			]);

			const durationInWeeks = Number(duration) / 3600 / 24 / 7;
			const isPeriodFinished = new Date().getTime() > Number(periodFinish) * 1000;
			const distribution = isPeriodFinished ? wei(0) : wei(rate).mul(duration).div(durationInWeeks);

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
			].map((data) => wei(data));

			const curveRate = inflationRate
				.mul(relativeWeight)
				.mul(31536000)
				.div(workingSupply)
				.mul(0.4)
				.div(curveSusdTokenPrice);

			const rewardsAPR = curveRate.mul(curvePrice);
			const swapAPR = swapData?.data?.apy?.day?.susd ?? wei(0);

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
			enabled: isAppReady && isWalletConnected && provider != null && isMainnet,
			...options,
		}
	);
};

export default useCurveSusdPoolQuery;
