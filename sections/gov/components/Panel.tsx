import React, { useMemo } from 'react';
import StructuredTab from 'components/StructuredTab';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { GovPanelType } from 'store/gov';

type PanelProps = {
	currentTab: string;
};

const Panel: React.FC<PanelProps> = ({ currentTab }) => {
	const { t } = useTranslation();
	const router = useRouter();

	const tabData = useMemo(
		() => [
			{
				title: t('gov.panel.council.title'),
				tabChildren: <></>,
				blue: true,
				key: GovPanelType.COUNCIL,
			},
			{
				title: t('gov.panel.grants.title'),
				tabChildren: <></>,
				blue: true,
				key: GovPanelType.GRANTS,
			},
			{
				title: t('gov.panel.proposals.title'),
				tabChildren: <></>,
				blue: true,
				key: GovPanelType.PROPOSAL,
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
			setPanelType={(key) => router.push(`/gov/${key}`)}
			currentPanel={t(`gov.panel.${currentTab}.title`)}
		/>
	);
};
export default Panel;
