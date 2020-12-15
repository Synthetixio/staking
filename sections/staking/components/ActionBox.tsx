import React, { useMemo, useEffect } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import StructuredTab from 'components/StructuredTab';

import BurnTab from './BurnTab';
import MintTab from './MintTab';
import Burn from 'assets/svg/app/burn.svg';
import Mint from 'assets/svg/app/mint.svg';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { useRecoilState } from 'recoil';
import { panelTypeState, StakingPanelType } from 'store/staking';

const ActionBox: React.FC = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const [panelType, setPanelType] = useRecoilState(panelTypeState);

	useEffect(() => {
		if (router.query.action && router.query.action.length > 0) {
			setPanelType(router.query.action[0] as StakingPanelType);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.query.action]);

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
			setPanelType={setPanelType}
			defaultTab={t(`staking.actions.${panelType}.title`)}
		/>
	);
};

export default ActionBox;
