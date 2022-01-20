import { useQuery } from 'react-query';
import { ethers } from 'ethers';
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

type StakingRewardsData = {
	apy: number;
	snx: number;
	eth: number;
};

const useGetUniswapStakingRewardsAPY = ({
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
					const { amount0Current, amount1Current } = balances;

					const totalValueInPool =
						(amount0Current / 1e18) * ethRate + (amount1Current / 1e18) * snxRate;
					const gUNIPrice = totalValueInPool / (gUNITotalSupply / 1e18);
					const yearProRata = ONE_YEAR / Number(duration);
					const gUNIValueInContract = (contractBalance / 1e18) * gUNIPrice;
					const rewardsValuePerYear = (rewardForDuration / 1e18) * yearProRata * snxRate;
					return {
						eth: amount0Current / 1e18,
						snx: amount1Current / 1e18,
						apy: (100 * rewardsValuePerYear) / gUNIValueInContract || 0,
					};
				}
				return null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{
			enabled: !!stakingRewardsContract && !!network && !!network.id && !!tokenContract,
			refetchIntervalInBackground: false,
			refetchInterval: false,
		}
	);
};

export default useGetUniswapStakingRewardsAPY;
