import React, { useMemo, FC, useEffect } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import StructuredTab from 'components/StructuredTab';

import BurnTab from './BurnTab';
import WrapETHTab from './MintTab';
import Burn from 'assets/svg/app/burn.svg';
import Mint from 'assets/svg/app/mint.svg';
import { useSetRecoilState } from 'recoil';
import { burnTypeState, StakingPanelType, mintTypeState } from 'store/staking';

type ActionBoxProps = {
	currentTab: string;
};

const ActionBox: FC<ActionBoxProps> = ({ currentTab }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const onMintTypeChange = useSetRecoilState(mintTypeState);
	const onBurnTypeChange = useSetRecoilState(burnTypeState);

	useEffect(() => {
		if (currentTab === StakingPanelType.MINT) {
			onBurnTypeChange(null);
		} else {
			onMintTypeChange(null);
		}
	}, [currentTab, onBurnTypeChange, onMintTypeChange]);

	const tabData = useMemo(
		() => [
			{
				title: 'Wrap',
				icon: <Svg src={Mint} />,
				tabChildren: <WrapETHTab />,
				blue: true,
				key: StakingPanelType.MINT,
			},
			{
				title: 'Unwrap',
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
			tabData={tabData}
			setPanelType={(key) => router.push(`/staking/${key}`)}
			currentPanel={currentTab}
		/>
	);
};

export default ActionBox;
