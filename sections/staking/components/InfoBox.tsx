import React, { useMemo } from 'react';
import Staking, { StakingPanelType } from '../context/StakingContext';
import StakingInfo from './StakingInfo';

const InfoBox: React.FC = () => {
	const { panelType } = Staking.useContainer();
	return useMemo(() => <StakingInfo isMint={panelType === StakingPanelType.MINT} />, [panelType]);
};

export default InfoBox;
