import Connector from 'containers/Connector';
import { BigNumber, Contract } from 'ethers';
import { useContainer } from 'unstated-next';

const ERC20HumanReadableABI = [
	'function balanceOf(address _owner) public view returns (uint256 balance)',
	'function approve(address _spender, uint256 _value) public returns (bool success)',
	'function allowance(address _owner, address _spender) public view returns (uint256 remaining)',
];

const StakingRewardsHumanReadableABI = [
	'function rewards(address _owner) public view returns (uint256 reward)',
];

export interface GUNILPTokenProps {
	pool: 'weth-snx' | 'susd-dai';
	userAddress: string | null;
}

const StakingRewardsSUSDDAIAddress = '0x7E11c004d20b502729918687E6E6777b28499085';
const StakingRewardsWETHSNXAddress = '0xfD49C7EE330fE060ca66feE33d49206eB96F146D';
const SUSDDAILPAddress = '0x88ccDBbA89E073C5DC08B9c84dfc1fDc152c0dAc';
const WETHSNXLPAddress = '0x83bEeFB4cA39af649D03969B442c0E9F4E1732D8';

function useGUNILPToken({ pool, userAddress }: GUNILPTokenProps) {
	const { provider, signer } = useContainer(Connector);
	const StakingRewardsWETHSNXContract = new Contract(
		StakingRewardsWETHSNXAddress,
		StakingRewardsHumanReadableABI
	);
	const StakingRewardsSUSDDAIPContract = new Contract(
		StakingRewardsSUSDDAIAddress,
		StakingRewardsHumanReadableABI
	);
	const WETHSNXLPTokenContract = new Contract(WETHSNXLPAddress, ERC20HumanReadableABI);
	const SUSDDAILPTokenContract = new Contract(SUSDDAILPAddress, ERC20HumanReadableABI);

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
	const approve = async (amount: BigNumber) => {
		if (signer) {
			const approved: boolean = await (pool === 'weth-snx'
				? WETHSNXLPTokenContract
				: SUSDDAILPTokenContract
			)
				.connect(signer)
				.approve(pool === 'weth-snx' ? WETHSNXLPAddress : SUSDDAILPAddress, amount);
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
				? StakingRewardsWETHSNXContract
				: StakingRewardsSUSDDAIPContract
			)
				.connect(provider)
				.rewards(userAddress);
			return rewards;
		}
	};
	return { balanceOf, approve, allowance, rewards };
}

export default useGUNILPToken;
