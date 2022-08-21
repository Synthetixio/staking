import StructuredTab from 'components/StructuredTab';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
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
  const [activeTab, setActiveTab] = useState('Add Liquidity');
  const theme = useTheme();
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
        color: theme.colors.blue,
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
        color: theme.colors.orange,
        key: 'Remove Liquidity',
      },
    ],
    [
      t,
      balance,
      rewardsToClaim,
      allowanceAmount,
      stakedTokens,
      fetchBalances,
      theme.colors.blue,
      theme.colors.orange,
    ]
  );
  return (
    <StructuredTab
      boxPadding={40}
      boxHeight={450}
      tabData={tabData}
      setActiveTab={setActiveTab}
      activeTab={activeTab}
    />
  );
}
