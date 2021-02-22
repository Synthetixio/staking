import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { StakingPanelType, BurnActionType, burnTypeState } from 'store/staking';
import { MintInfo, BurnInfo, ClearDebtInfo } from './StakingInfo';

type InfoBoxProps = {
	currentTab: string;
};

const InfoBox: React.FC<InfoBoxProps> = ({ currentTab }) => {
	const burnType = useRecoilValue(burnTypeState);
	const isMint = currentTab === StakingPanelType.MINT;
	const isClearDebt = burnType === BurnActionType.CLEAR;

	return useMemo(() => (isMint ? <MintInfo /> : isClearDebt ? <ClearDebtInfo /> : <BurnInfo />), [
		isMint,
		isClearDebt,
	]);
};

export default InfoBox;
