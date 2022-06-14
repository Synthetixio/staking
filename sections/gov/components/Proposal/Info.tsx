import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalInfoType } from 'store/gov';
import StructuredTab from 'components/StructuredTab';
import Results from './Results';
import History from './History';
import useSynthetixQueries, { Proposal } from '@synthetixio/queries';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';

type InfoProps = {
	proposal: Proposal;
};

const Info: React.FC<InfoProps> = ({ proposal }) => {
	const { t } = useTranslation();

	const walletAddress = useRecoilValue(walletAddressState);
	const { useProposalQuery } = useSynthetixQueries();
	const proposalResults = useProposalQuery(
		snapshotEndpoint,
		SPACE_KEY.PROPOSAL,
		proposal.id,
		walletAddress
	);
	const [activeTab, setActiveTab] = useState(ProposalInfoType.RESULTS);

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

	return (
		<StructuredTab
			boxPadding={0}
			tabData={tabData}
			activeTab={activeTab}
			setActiveTab={(key) => setActiveTab(key)}
		/>
	);
};
export default Info;
