import React, { Dispatch, SetStateAction, useMemo } from 'react';
import StructuredTab from 'components/StructuredTab';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { useTranslation } from 'react-i18next';
import StakingRewardsTab from './StakingRewardsTab';
import { EscrowPanelType } from 'sections/escrow';

type ActionBoxProps = {
	canVestAmount: number;
	setPanelType: Dispatch<SetStateAction<any>>;
	isLoaded: boolean;
};

const ActionBox: React.FC<ActionBoxProps> = ({ canVestAmount, setPanelType, isLoaded }) => {
	const { t } = useTranslation();
	const tabData = useMemo(
		() => [
			{
				title: t('escrow.actions.staking.title'),
				tabChildren: <StakingRewardsTab canVestAmount={canVestAmount} />,
				key: EscrowPanelType.STAKING,
			},
			{
				title: t('escrow.actions.ico.title'),
				tabChildren: <></>,
				key: EscrowPanelType.ICO,
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
