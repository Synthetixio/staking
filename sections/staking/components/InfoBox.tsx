import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { StakingPanelType, BurnActionType, burnTypeState } from 'store/staking';
import { MintInfo, BurnInfo, ClearDebtInfo, SelfLiquidationInfo } from './StakingInfo';

type InfoBoxProps = {
  currentTab: string;
};

const InfoBox: React.FC<InfoBoxProps> = ({ currentTab }) => {
  const burnType = useRecoilValue(burnTypeState);
  const isMint = currentTab === StakingPanelType.MINT;
  const isSelfLiquidation = currentTab === StakingPanelType.SELF_LIQUIDATE;
  const isClearDebt = burnType === BurnActionType.CLEAR;

  return useMemo(() => {
    if (isMint) return <MintInfo />;
    if (isSelfLiquidation) return <SelfLiquidationInfo />;
    return isClearDebt ? <ClearDebtInfo /> : <BurnInfo />;
  }, [isMint, isSelfLiquidation, isClearDebt]);
};

export default InfoBox;
