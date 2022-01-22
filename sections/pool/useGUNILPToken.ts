import synthetix, { NetworkId } from '@synthetixio/contracts-interface';
import { WETHSNXLPTokenContract } from 'constants/gelato';
import Connector from 'containers/Connector';
import { BigNumber } from 'ethers';

export interface GUNILPTokenProps {
	pool: 'weth-snx' | 'susd-dai';
	userAddress: string | null;
}

export function useGUNILPToken({ userAddress }: GUNILPTokenProps) {
	const { provider, signer } = Connector.useContainer();
	const snxjs = synthetix({ networkId: NetworkId['Mainnet-Ovm'], useOvm: true });

	const balanceOf = async () => {
		if (provider && userAddress) {
			const balance: BigNumber = await WETHSNXLPTokenContract.connect(provider).balanceOf(
				userAddress
			);
			return balance;
		}
	};
	const stakedTokensBalance = async () => {
		if (provider && userAddress) {
			const stakedBalance: BigNumber = await snxjs.contracts.StakingRewardsSNXWETHUniswapV3.connect(
				provider
			).balanceOf(userAddress);
			return stakedBalance;
		}
	};
	const approve = async (amount: BigNumber) => {
		if (signer) {
			const approved: boolean = await WETHSNXLPTokenContract.connect(signer).approve(
				snxjs.contracts.StakingRewardsSNXWETHUniswapV3.address,
				amount
			);
			return approved;
		}
	};
	const allowance = async () => {
		if (provider && userAddress) {
			const result: BigNumber = await WETHSNXLPTokenContract.connect(provider).allowance(
				userAddress,
				snxjs.contracts.StakingRewardsSNXWETHUniswapV3.address
			);
			return result;
		}
	};

	const rewards = async () => {
		if (provider && userAddress) {
			const rewards: BigNumber = await snxjs.contracts.StakingRewardsSNXWETHUniswapV3.connect(
				provider
			).earned(userAddress);
			return rewards;
		}
	};
	return { balanceOf, approve, allowance, rewards, stakedTokensBalance };
}
