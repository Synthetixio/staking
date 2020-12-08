import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { panelTypeState, StakingPanelType } from 'store/staking';
import StakingInfo from './StakingInfo';

const InfoBox: React.FC = () => {
	const panelType = useRecoilValue(panelTypeState);

	return useMemo(() => <StakingInfo isMint={panelType === StakingPanelType.MINT} />, [panelType]);
};

export default InfoBox;
