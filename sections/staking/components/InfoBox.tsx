import React, { useMemo } from 'react';
import { StakingPanelType } from 'store/staking';
import StakingInfo from './StakingInfo';

type InfoBoxProps = {
	currentTab: string;
};

const InfoBox: React.FC<InfoBoxProps> = ({ currentTab }) => {
	return useMemo(() => <StakingInfo isMint={currentTab === StakingPanelType.MINT} />, [currentTab]);
};

export default InfoBox;
