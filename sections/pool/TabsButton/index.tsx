import StructuredTab from 'components/StructuredTab';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PoolTab, { PoolTabProps } from '../Tab';

type PoolTabsProps = Omit<PoolTabProps, 'action' | 'stakingRewardsContractName'>;

export default function PoolTabs({
	balance,
	rewardsToClaim,
	allowanceAmount,
	fetchBalances,
	stakedTokens,
}: PoolTabsProps) {
	const { t } = useTranslation();
	const tabData = useMemo(
		() => [
			{
				title: t('pool.tab.add'),
				tabChildren: (
					<PoolTab
						action="add"
						balance={balance}
						rewardsToClaim={rewardsToClaim}
						allowanceAmount={allowanceAmount}
						stakedTokens={stakedTokens}
						fetchBalances={fetchBalances}
						stakingRewardsContractName={'StakingRewardsSNXWETHUniswapV3'}
					/>
				),
				blue: true,
				key: 'Add Liquidity',
			},
			{
				title: t('pool.tab.remove'),
				tabChildren: (
					<PoolTab
						action="remove"
						balance={balance}
						rewardsToClaim={rewardsToClaim}
						allowanceAmount={allowanceAmount}
						stakedTokens={stakedTokens}
						fetchBalances={fetchBalances}
						stakingRewardsContractName={'StakingRewardsSNXWETHUniswapV3'}
					/>
				),
				blue: false,
				key: 'Remove Liquidity',
			},
		],
		[t, balance, rewardsToClaim, allowanceAmount, stakedTokens, fetchBalances]
	);
	return <StructuredTab boxPadding={40} boxHeight={450} tabData={tabData} />;
}
