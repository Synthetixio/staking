import React, { useMemo } from 'react';
import StructuredTab from 'components/StructuredTab';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { useTranslation } from 'react-i18next';
import StakingRewardsTab from './StakingRewardsTab';
import { EscrowPanelType } from 'store/escrow';
import TokenSaleTab from './TokenSaleTab';
import { useRouter } from 'next/router';

type ActionBoxProps = {
	currentTab: string;
};

const ActionBox: React.FC<ActionBoxProps> = ({ currentTab }) => {
	const { t } = useTranslation();
	const router = useRouter();

	const tabData = useMemo(
		() => [
			{
				title: t('escrow.actions.staking.title'),
				tabChildren: <StakingRewardsTab />,
				key: EscrowPanelType.REWARDS,
				blue: true,
			},
			{
				title: t('escrow.actions.ico.title'),
				tabChildren: <TokenSaleTab />,
				key: EscrowPanelType.ICO,
				blue: false,
			},
		],
		[t]
	);

	return (
		<StructuredTab
			boxPadding={20}
			boxWidth={BOX_COLUMN_WIDTH}
			tabData={tabData}
			setPanelType={(key) => router.push(`/escrow/${key}`)}
			currentPanel={currentTab}
		/>
	);
};

export default ActionBox;
