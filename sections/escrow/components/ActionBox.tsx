import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import StructuredTab from 'components/StructuredTab';
import { useTranslation } from 'react-i18next';
import StakingRewardsTab from './StakingRewardsTab';
import { EscrowPanelType } from 'store/escrow';
import TokenSaleTab from './TokenSaleTab';
import { useRouter } from 'next/router';
import { isL2State } from 'store/wallet';
import { useTheme } from 'styled-components';

type ActionBoxProps = {
	currentTab: string;
};

const ActionBox: React.FC<ActionBoxProps> = ({ currentTab }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const isL2 = useRecoilValue(isL2State);
	const theme = useTheme();
	const tabData = useMemo(
		() => [
			{
				title: t('escrow.actions.staking.title'),
				tabChildren: <StakingRewardsTab />,
				key: EscrowPanelType.REWARDS,
				color: theme.colors.blue,
			},
			{
				title: t('escrow.actions.ico.title'),
				tabChildren: <TokenSaleTab />,
				key: EscrowPanelType.ICO,
				disabled: isL2,
				color: theme.colors.orange,
			},
		],
		[t, theme.colors.blue, theme.colors.orange, isL2]
	);

	return (
		<StructuredTab
			boxPadding={20}
			tabData={tabData}
			setPanelType={(key) => router.push(`/escrow/${key}`)}
			currentPanel={currentTab}
		/>
	);
};

export default ActionBox;
