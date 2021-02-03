import React, { FC, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { EscrowPanelType, panelTypeState } from 'store/escrow';
import RewardEscrowSchedule from './RewardEscrowSchedule';
import TokenSaleEscrowSchedule from './TokenSaleEscrowSchedule';

const EscrowTable: FC = () => {
	const panelType = useRecoilValue(panelTypeState);
	const returnSchedule = useMemo(
		() =>
			panelType === EscrowPanelType.REWARDS ? (
				<RewardEscrowSchedule />
			) : (
				<TokenSaleEscrowSchedule />
			),
		[panelType]
	);

	return returnSchedule;
};

export default EscrowTable;
