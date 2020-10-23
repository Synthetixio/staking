import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import StructuredTab from 'components/StructuredTab';

interface LPBoxProps {}

const LPBox: FC<LPBoxProps> = ({}) => {
	const { t } = useTranslation();
	const tabData = useMemo(
		() => [
			{
				title: t('earn.actions.stake.title'),
				tabChildren: <>Stake tab goes here</>,
			},
			{
				title: t('earn.actions.unstake.title'),
				tabChildren: <>Unstake tab goes here</>,
			},
			{
				title: t('earn.actions.rewards.title'),
				tabChildren: <>Rewards tab goes here</>,
			},
		],
		[]
	);
	return (
		<>
			<StructuredTab boxPadding={25} boxHeight={400} boxWidth={450} tabData={tabData} />
		</>
	);
};

export default LPBox;
