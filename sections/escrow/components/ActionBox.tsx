import React, { useMemo } from 'react';
import StructuredTab from 'components/StructuredTab';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { useTranslation } from 'react-i18next';
import StakingRewardsTab from './StakingRewardsTab';
import { useSetRecoilState } from 'recoil';
import { EscrowPanelType, panelTypeState } from 'store/escrow';
import TokenSaleTab from './TokenSaleTab';

const ActionBox: React.FC = () => {
	const { t } = useTranslation();
	const setPanelType = useSetRecoilState(panelTypeState);

	const tabData = useMemo(
		() => [
			{
				title: t('escrow.actions.staking.title'),
				tabChildren: <StakingRewardsTab />,
				key: EscrowPanelType.STAKING,
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
			boxHeight={450}
			boxWidth={BOX_COLUMN_WIDTH}
			tabData={tabData}
			setPanelType={setPanelType}
		/>
	);
};

export default ActionBox;
