import React, { useMemo } from 'react';
import Staking from '../context/StakingContext';
import StakingInfo from './StakingInfo';

const InfoBox: React.FC = () => {
	const { panelType } = Staking.useContainer();
	const returnInfoPanel = useMemo(() => <StakingInfo isMint={panelType === 'mint'} />, [panelType]);
	return returnInfoPanel;
};

export default InfoBox;
