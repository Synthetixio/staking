import {
	StakingRewardsSUSDDAIAddress,
	StakingRewardsSUSDDAIPContract,
	StakingRewardsWETHSNXAddress,
	stakingRewardsContractWETHSNX,
	SUSDDAILPTokenContract,
	WETHSNXLPTokenContract,
} from 'constants/gelato';
import Connector from 'containers/Connector';
import { BigNumber } from 'ethers';
import { useContainer } from 'unstated-next';

export interface GUNILPTokenProps {
	pool: 'weth-snx' | 'susd-dai';
	userAddress: string | null;
}

function useGUNILPToken({ pool, userAddress }: GUNILPTokenProps) {
	const { provider, signer } = useContainer(Connector);

	const balanceOf = async () => {
		if (provider && userAddress) {
			const balance: BigNumber = await (pool === 'weth-snx'
				? WETHSNXLPTokenContract
				: SUSDDAILPTokenContract
			)
				.connect(provider)
				.balanceOf(userAddress);
			return balance;
		}
	};
	const stakedTokensBalance = async () => {
		if (provider && userAddress) {
			const stakedBalance: BigNumber = await (pool === 'weth-snx'
				? stakingRewardsContractWETHSNX
				: StakingRewardsSUSDDAIPContract
			)
				.connect(provider)
				.balanceOf(userAddress);
			return stakedBalance;
		}
	};
	const approve = async (amount: BigNumber) => {
		if (signer) {
			const approved: boolean = await (pool === 'weth-snx'
				? WETHSNXLPTokenContract
				: SUSDDAILPTokenContract
			)
				.connect(signer)
				.approve(
					pool === 'weth-snx' ? StakingRewardsWETHSNXAddress : StakingRewardsSUSDDAIAddress,
					amount
				);
			return approved;
		}
	};
	const allowance = async () => {
		if (provider && userAddress) {
			const result: BigNumber = await (pool === 'weth-snx'
				? WETHSNXLPTokenContract
				: SUSDDAILPTokenContract
			)
				.connect(provider)
				.allowance(
					userAddress,
					pool === 'weth-snx' ? StakingRewardsWETHSNXAddress : StakingRewardsSUSDDAIAddress
				);
			return result;
		}
	};

	const rewards = async () => {
		if (provider && userAddress) {
			const rewards: BigNumber = await (pool === 'weth-snx'
				? stakingRewardsContractWETHSNX
				: StakingRewardsSUSDDAIPContract
			)
				.connect(provider)
				.rewards(userAddress);
			return rewards;
		}
	};
	return { balanceOf, approve, allowance, rewards, stakedTokensBalance };
}

export default useGUNILPToken;
