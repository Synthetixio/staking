import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalInfoType } from 'store/gov';
import StructuredTab from 'components/StructuredTab';
import Results from './Results';
import History from './History';
import useSynthetixQueries from '@synthetixio/queries';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';
import Connector from 'containers/Connector';

type InfoProps = {
  proposalId: string;
};

const Info: React.FC<InfoProps> = ({ proposalId }) => {
  const { t } = useTranslation();
  const { walletAddress } = Connector.useContainer();

  const { useProposalQuery } = useSynthetixQueries();
  const proposalResults = useProposalQuery(
    snapshotEndpoint,
    SPACE_KEY.PROPOSAL,
    proposalId,
    walletAddress
  );
  const [activeTab, setActiveTab] = useState(ProposalInfoType.RESULTS);

  const tabData = useMemo(
    () => [
      {
        title: t('gov.proposal.votes.title'),
        tabChildren: <Results proposalResults={proposalResults} />,
        key: ProposalInfoType.RESULTS,
      },
      {
        title: t('gov.proposal.history.title', {
          count: proposalResults.data?.voteList.length ?? undefined,
        }),
        tabChildren: <History proposalResults={proposalResults} hash={proposalId} />,
        key: ProposalInfoType.HISTORY,
      },
    ],
    [proposalResults, proposalId, t]
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
