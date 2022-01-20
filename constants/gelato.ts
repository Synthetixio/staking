import { Contract } from 'ethers';
import ERC20ABI from '@synthetixio/queries/build/node/src/abis/ERC20.json';

export const StakingRewardsSUSDDAIAddress = '0x7E11c004d20b502729918687E6E6777b28499085';
export const StakingRewardsWETHSNXAddress = '0xfD49C7EE330fE060ca66feE33d49206eB96F146D';
const SUSDDAILPAddress = '0x88ccDBbA89E073C5DC08B9c84dfc1fDc152c0dAc';
const WETHSNXLPAddress = '0x83bEeFB4cA39af649D03969B442c0E9F4E1732D8';

const StakingRewardsHumanReadableABI = [
	'function rewards(address _owner) public view returns (uint256 reward)',
	'function balanceOf(address _owner) public view returns (uint256 balance)',
];

export const StakingRewardsWETHSNXContract = new Contract(
	StakingRewardsWETHSNXAddress,
	StakingRewardsHumanReadableABI
);
export const StakingRewardsSUSDDAIPContract = new Contract(
	StakingRewardsSUSDDAIAddress,
	StakingRewardsHumanReadableABI
);
export const WETHSNXLPTokenContract = new Contract(WETHSNXLPAddress, ERC20ABI);
export const SUSDDAILPTokenContract = new Contract(SUSDDAILPAddress, ERC20ABI);
