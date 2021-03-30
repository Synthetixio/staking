import { useRouter } from 'next/router';
import React, { FC, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { EscrowPanelType } from 'store/escrow';
import { isWalletConnectedState } from 'store/wallet';
import RewardEscrowSchedule from './RewardEscrowSchedule';
import TokenSaleEscrowSchedule from './TokenSaleEscrowSchedule';

const EscrowTable: FC = () => {
	const router = useRouter();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const activeTab = useMemo(
		() =>
			isWalletConnected && Array.isArray(router.query.action) && router.query.action.length
				? router.query.action[0]
				: null,
		[router.query.action, isWalletConnected]
	);

	const returnSchedule = useMemo(
		() =>
			!activeTab || activeTab === EscrowPanelType.REWARDS ? (
				<RewardEscrowSchedule />
			) : (
				<TokenSaleEscrowSchedule />
			),
		[activeTab]
	);

	return returnSchedule;
};

export default EscrowTable;
