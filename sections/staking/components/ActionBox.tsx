import React, { useEffect, useMemo } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import StructuredTab from 'components/StructuredTab';

import BurnTab from './BurnTab';
import MintTab from './MintTab';
import Burn from 'assets/svg/app/burn.svg';
import Mint from 'assets/svg/app/mint.svg';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { burnTypeState, panelTypeState, StakingPanelType, mintTypeState } from 'store/staking';

const ActionBox: React.FC = () => {
	const { t } = useTranslation();
	const [panelType, onPanelTypeChange] = useRecoilState(panelTypeState);
	const onMintTypeChange = useSetRecoilState(mintTypeState);
	const onBurnTypeChange = useSetRecoilState(burnTypeState);

	useEffect(() => {
		if (panelType === StakingPanelType.MINT) {
			onBurnTypeChange(null);
		} else {
			onMintTypeChange(null);
		}
	}, [panelType]);

	const tabData = useMemo(
		() => [
			{
				title: t('staking.actions.mint.title'),
				icon: <Svg src={Mint} />,
				tabChildren: <MintTab />,
				blue: true,
				key: StakingPanelType.MINT,
			},
			{
				title: t('staking.actions.burn.title'),
				icon: <Svg src={Burn} />,
				tabChildren: <BurnTab />,
				blue: false,
				key: StakingPanelType.BURN,
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
			setPanelType={onPanelTypeChange}
		/>
	);
};

export default ActionBox;
