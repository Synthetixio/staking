import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalInfoType } from 'store/gov';
import StructuredTab from 'components/StructuredTab';
import Results from './Results';
import History from './History';
import useProposal from 'queries/gov/useProposal';
import useActiveTab from 'sections/gov/hooks/useActiveTab';
import { Proposal } from 'queries/gov/types';

type InfoProps = {
	proposal: Proposal;
};

const Info: React.FC<InfoProps> = ({ proposal }) => {
	const { t } = useTranslation();
	const activeTab = useActiveTab();
	const proposalResults = useProposal(activeTab, proposal.id);

	const tabData = useMemo(
		() => [
			{
				title: t('gov.proposal.votes.title'),
				tabChildren: <Results proposalResults={proposalResults} hash={proposal.id} />,
				blue: true,
				key: ProposalInfoType.RESULTS,
			},
			{
				title: t('gov.proposal.history.title'),
				tabChildren: <History proposalResults={proposalResults} hash={proposal.id} />,
				blue: true,
				key: ProposalInfoType.HISTORY,
			},
		],
		[proposalResults, proposal, t]
	);

	return (
		<>
			<StructuredTab boxPadding={0} tabData={tabData} />
		</>
	);
};
export default Info;
