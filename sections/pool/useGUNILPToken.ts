import { WETHSNXLPTokenContract } from 'constants/gelato';
import Connector from 'containers/Connector';
import { BigNumber } from 'ethers';
import { useCallback } from 'react';

export interface GUNILPTokenProps {
	pool: 'weth-snx' | 'susd-dai';
	userAddress: string | null;
}

export function useGUNILPToken({ userAddress }: GUNILPTokenProps) {
	const { provider, signer, synthetixjs } = Connector.useContainer();

	const balanceOf = useCallback(async () => {
		if (provider && userAddress) {
			const balance: BigNumber = await WETHSNXLPTokenContract.connect(provider).balanceOf(
				userAddress
			);
			return balance;
		}
	}, [provider, userAddress]);
	const stakedTokensBalance = useCallback(async () => {
		if (provider && userAddress && synthetixjs) {
			const stakedBalance: BigNumber =
				await synthetixjs.contracts.StakingRewardsSNXWETHUniswapV3.connect(provider).balanceOf(
					userAddress
				);
			return stakedBalance;
		}
	}, [provider, synthetixjs, userAddress]);
	const approve = useCallback(
		async (amount: BigNumber) => {
			if (signer && synthetixjs) {
				const approved: boolean = await WETHSNXLPTokenContract.connect(signer).approve(
					synthetixjs.contracts.StakingRewardsSNXWETHUniswapV3.address,
					amount
				);
				return approved;
			}
		},
		[signer, synthetixjs]
	);
	const allowance = useCallback(async () => {
		if (provider && userAddress && synthetixjs) {
			const result: BigNumber = await WETHSNXLPTokenContract.connect(provider).allowance(
				userAddress,
				synthetixjs.contracts.StakingRewardsSNXWETHUniswapV3.address
			);
			return result;
		}
	}, [provider, synthetixjs, userAddress]);

	const rewards = useCallback(async () => {
		if (provider && userAddress && synthetixjs) {
			const rewards: BigNumber = await synthetixjs.contracts.StakingRewardsSNXWETHUniswapV3.connect(
				provider
			).earned(userAddress);
			return rewards;
		}
	}, [provider, synthetixjs, userAddress]);
	return { balanceOf, approve, allowance, rewards, stakedTokensBalance };
}
