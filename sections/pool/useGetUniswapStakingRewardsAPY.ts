import { useQuery } from 'react-query';
import { BigNumber, ethers, utils } from 'ethers';
import Connector from 'containers/Connector';

const ONE_YEAR = 365 * 24 * 3600;
const GELATO_POOL_ADDRESS = '0x83bEeFB4cA39af649D03969B442c0E9F4E1732D8'; // WETH/SNX
const GELTAO_POOL_ABI = [
	{
		inputs: [],
		name: 'getUnderlyingBalances',
		outputs: [
			{ internalType: 'uint256', name: 'amount0Current', type: 'uint256' },
			{ internalType: 'uint256', name: 'amount1Current', type: 'uint256' },
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'totalSupply',
		outputs: [
			{
				name: '',
				type: 'uint256',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
];

// TODO @MF implement that rewards
// const rewards = 60000e18 - SNX decimal 18

type StakingRewardsData = {
	apy: string;
	snx: string;
	eth: string;
};

export const useGetUniswapStakingRewardsAPY = ({
	stakingRewardsContract,
	tokenContract,
}: {
	stakingRewardsContract: ethers.Contract | null;
	tokenContract: ethers.Contract | null;
}) => {
	const { provider, network } = Connector.useContainer();
	return useQuery<StakingRewardsData | null>(
		[
			'uniswapStakingRewardsAPY',
			stakingRewardsContract?.address,
			tokenContract?.address,
			network?.id,
		],
		async () => {
			try {
				if (provider) {
					const GelatoPoolContract = new ethers.Contract(
						GELATO_POOL_ADDRESS,
						GELTAO_POOL_ABI,
						provider
					);
					const [
						balances,
						gUNITotalSupply,
						ratesResults,
						rewardForDuration,
						duration,
						contractBalance,
					] = await Promise.all([
						GelatoPoolContract.getUnderlyingBalances(),
						GelatoPoolContract.totalSupply(),
						fetch(
							'https://api.coingecko.com/api/v3/simple/price?ids=havven%2Cethereum&vs_currencies=usd'
						),
						stakingRewardsContract?.connect(provider).getRewardForDuration(),
						stakingRewardsContract?.connect(provider).rewardsDuration(),
						tokenContract?.connect(provider).balanceOf(stakingRewardsContract?.address),
					]);
					const {
						havven: { usd: snxRate },
						ethereum: { usd: ethRate },
					} = await ratesResults.json();
					const { amount0Current, amount1Current } = balances as Record<
						'amount0Current' | 'amount1Current',
						BigNumber
					>;
					const ethRateBigNumber = utils.parseEther(ethRate.toString());
					const snxRateBigNumber = utils.parseUnits(snxRate.toString(), 18);
					const decimal = utils.parseEther('1');
					const totalValueInPool: BigNumber = amount0Current
						// .div(decimal)
						.mul(ethRateBigNumber)
						.add(
							amount1Current
								//.div(decimal)
								.mul(snxRateBigNumber)
						);
					const gUNIPrice = totalValueInPool.div(
						gUNITotalSupply
						//.div(decimal)
					);
					// console.log('G UNI PRICE', gUNIPrice.toString());
					const yearProRata = ONE_YEAR / duration.toNumber();
					// console.log('YEAR PRO RATA', yearProRata);
					const gUNIValueInContract = contractBalance
						//.div(decimal)
						.mul(gUNIPrice);
					const rewardsValuePerYear = rewardForDuration
						// .div(decimal)
						.mul(BigNumber.from(yearProRata.toFixed()))
						.mul(snxRateBigNumber);
					//console.log(rewardForDuration.toString());
					return {
						eth: amount0Current.toString() /*.div(decimal)*/,
						snx: amount1Current.toString() /*.div(decimal)*/,
						apy: rewardsValuePerYear
							//.mul(BigNumber.from('100'))
							.div(gUNIValueInContract)
							.toString(),
					};
				}
				return {
					eth: '0',
					snx: '0',
					apy: '0',
				};
			} catch (e) {
				console.error(e);
				return {
					eth: '0',
					snx: '0',
					apy: '0',
				};
			}
		},
		{
			enabled: !!stakingRewardsContract && !!network && !!network.id && !!tokenContract,
			refetchIntervalInBackground: false,
			refetchInterval: false,
		}
	);
};
