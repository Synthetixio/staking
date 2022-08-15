import React, { useMemo, FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { useTheme } from 'styled-components';

import StructuredTab from 'components/StructuredTab';

import BurnTab from './BurnTab';
import MintTab from './MintTab';
import Burn from 'assets/svg/app/burn.svg';
import Mint from 'assets/svg/app/mint.svg';
import Warning from 'assets/svg/app/warning.svg';
import { useSetRecoilState } from 'recoil';
import { burnTypeState, StakingPanelType, mintTypeState } from 'store/staking';
import SelfLiquidateTab from './SelfLiquidateTab';

type ActionBoxProps = {
  currentTab: string;
};

const ActionBox: FC<ActionBoxProps> = ({ currentTab }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const onMintTypeChange = useSetRecoilState(mintTypeState);
  const onBurnTypeChange = useSetRecoilState(burnTypeState);
  const theme = useTheme();

  useEffect(() => {
    if (currentTab === StakingPanelType.MINT) {
      onBurnTypeChange(null);
    } else {
      onMintTypeChange(null);
    }
  }, [currentTab, onBurnTypeChange, onMintTypeChange]);

  const tabData = useMemo(
    () => [
      {
        title: t('staking.actions.mint.title'),
        icon: <Mint width="27" />,
        tabChildren: <MintTab />,
        color: theme.colors.blue,
        key: StakingPanelType.MINT,
      },
      {
        title: t('staking.actions.burn.title'),
        icon: <Burn width="38" />,
        tabChildren: <BurnTab />,
        color: theme.colors.orange,
        key: StakingPanelType.BURN,
      },

      {
        title: t('staking.actions.self-liquidate.title'),
        icon: <Warning width={38} />,
        tabChildren: <SelfLiquidateTab />,
        color: theme.colors.pink,
        key: StakingPanelType.SELF_LIQUIDATE,
      },
    ],
    [t, theme.colors.blue, theme.colors.orange, theme.colors.pink]
  );

  return (
    <StructuredTab
      boxPadding={20}
      boxHeight={450}
      tabData={tabData}
      setActiveTab={(key) => router.push(`/staking/${key}`)}
      activeTab={currentTab}
    />
  );
};

export default ActionBox;
