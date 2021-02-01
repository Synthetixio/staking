import React, { useMemo } from 'react';
import StructuredTab from 'components/StructuredTab';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { GovPanelType } from 'store/gov';
import ProposalList from './ProposalList';
import { SPACES } from 'queries/gov/types';
import useCouncilProposals from 'queries/gov/useCouncilProposals';
import useGovernanceProposals from 'queries/gov/useGovernanceProposals';

type PanelProps = {
	currentTab: string;
};

const Panel: React.FC<PanelProps> = ({ currentTab }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const councilProposals = useCouncilProposals();
	const govProposals = useGovernanceProposals();

	const tabData = useMemo(
		() => [
			{
				title: t('gov.panel.council.title'),
				tabChildren: (
					<ProposalList data={councilProposals.data ?? []} isLoaded={!councilProposals.isLoading} />
				),
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
				tabChildren: (
					<ProposalList data={govProposals.data ?? []} isLoaded={!govProposals.isLoading} />
				),
				blue: true,
				key: GovPanelType.PROPOSAL,
			},
		],
		[t, councilProposals, govProposals]
	);
	return (
		<StructuredTab
			boxPadding={0}
			boxHeight={450}
			boxWidth={BOX_COLUMN_WIDTH}
			tabData={tabData}
			setPanelType={(key) => router.push(`/gov/${key}`)}
			currentPanel={t(`gov.panel.${currentTab}.title`)}
		/>
	);
};
export default Panel;
