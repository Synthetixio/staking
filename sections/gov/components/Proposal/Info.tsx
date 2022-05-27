import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalInfoType } from 'store/gov';
import StructuredTab from 'components/StructuredTab';
import Results from './Results';
import History from './History';
import useActiveTab from 'sections/gov/hooks/useActiveTab';
import useSynthetixQueries, { Proposal } from '@synthetixio/queries';
import { snapshotEndpoint } from 'constants/snapshot';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';

type InfoProps = {
	proposal: Proposal;
};

const Info: React.FC<InfoProps> = ({ proposal }) => {
	const { t } = useTranslation();
	const activeTab = useActiveTab();

	const walletAddress = useRecoilValue(walletAddressState);
	const { useProposalQuery } = useSynthetixQueries();
	const proposalResults = useProposalQuery(snapshotEndpoint, activeTab, proposal.id, walletAddress);

	const tabData = useMemo(
		() => [
			{
				title: t('gov.proposal.votes.title'),
				tabChildren: <Results proposalResults={proposalResults} hash={proposal.id} />,
				key: ProposalInfoType.RESULTS,
			},
			{
				title: t('gov.proposal.history.title', {
					count: proposalResults.data?.voteList.length ?? undefined,
				}),
				tabChildren: <History proposalResults={proposalResults} hash={proposal.id} />,
				key: ProposalInfoType.HISTORY,
			},
		],
		[proposalResults, proposal, t]
	);

	return <StructuredTab boxPadding={0} tabData={tabData} />;
};
export default Info;
