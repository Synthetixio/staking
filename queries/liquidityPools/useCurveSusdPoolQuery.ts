import { useQuery, QueryConfig } from 'react-query';
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
import { makeWeb3Contract } from 'utils/web3';

import { LiquidityPoolData } from './types';
import { getCurveTokenPrice } from './helper';
import { toBigNumber } from 'utils/formatters/number';

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

			const curveSusdGaugeContractWeb3 = makeWeb3Contract(
				curveSusdGauge.address,
				curveSusdGauge.abi
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
				// curveSusdGaugeContract.inflation_rate(),
				// curveSusdGaugeContract.working_supply(),
				new Promise((resolve, reject) => {
					curveSusdGaugeContractWeb3.methods.inflation_rate().call((err: any, v: string) => {
						if (err) return reject(err);
						resolve(v);
					});
				}),
				new Promise((resolve, reject) => {
					curveSusdGaugeContractWeb3.methods.working_supply().call((err: any, v: string) => {
						if (err) return reject(err);
						resolve(v);
					});
				}),
				curveGaugeControllerContract.gauge_relative_weight(curveSusdGauge.address),
				curveTokenPrice,
				axios.get('https://stats.curve.fi/raw-stats/apys.json'),
				contract.earned(walletAddress),
				curveSusdGaugeContract.balanceOf(walletAddress),
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
			].map((data) => Number(toBigNumber(data.toString()).div(1e18)));

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
				stakedBN: curveStaked,
				duration: Number(duration) * 1000,
				allowance,
				userBalance,
				userBalanceBN: curveSusdUserBalance,
			};
		},
		{
			enabled: isAppReady && isWalletConnected && provider != null && isMainnet,
			...options,
		}
	);
};

export default useCurveSusdPoolQuery;
