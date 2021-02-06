import React, { useMemo } from 'react';
import StructuredTab from 'components/StructuredTab';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import ProposalList from './ProposalList';
import useProposals from 'queries/gov/useProposals';
import { SPACE_KEY } from 'constants/snapshot';

type PanelProps = {
	currentTab: string;
};

const Panel: React.FC<PanelProps> = ({ currentTab }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const councilProposals = useProposals(SPACE_KEY.COUNCIL);
	const govProposals = useProposals(SPACE_KEY.PROPOSAL);
	const grantsProposals = useProposals(SPACE_KEY.GRANTS);

	const tabData = useMemo(
		() => [
			{
				title: t('gov.panel.council.title'),
				tabChildren: (
					<ProposalList data={councilProposals.data ?? []} isLoaded={!councilProposals.isLoading} />
				),
				blue: true,
				key: SPACE_KEY.COUNCIL,
			},
			{
				title: t('gov.panel.grants.title'),
				tabChildren: (
					<ProposalList data={grantsProposals.data ?? []} isLoaded={!grantsProposals.isLoading} />
				),
				blue: true,
				key: SPACE_KEY.GRANTS,
			},
			{
				title: t('gov.panel.proposals.title'),
				tabChildren: (
					<ProposalList data={govProposals.data ?? []} isLoaded={!govProposals.isLoading} />
				),
				blue: true,
				key: SPACE_KEY.PROPOSAL,
			},
		],
		[t, councilProposals, govProposals, grantsProposals]
	);
	return (
		<StructuredTab
			boxPadding={20}
			boxHeight={600}
			boxWidth={750}
			tabData={tabData}
			setPanelType={(key) => router.push(`/gov/${key}`)}
			currentPanel={currentTab}
		/>
	);
};
export default Panel;
