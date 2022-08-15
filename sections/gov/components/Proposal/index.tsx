import React from 'react';
import { Grid, Col } from 'sections/gov/components/common';
import Content from './Content';
import Details from './Details';
import Info from './Info';
import { useQuery } from 'react-query';
import { snapshotEndpoint } from 'constants/snapshot';
import { useRouter } from 'next/router';

type ProposalProps = {
  onBack: Function;
};

const gql = (data: any) => data[0];
const query = gql`
  query Proposals($id: String) {
    proposal(id: $id) {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      space {
        id
        name
      }
    }
  }
`;

export async function fetchProposals(hash: string | undefined) {
  const body = await fetch(snapshotEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        id: hash,
      },
    }),
  });

  const { data, errors } = await body.json();
  if (data?.proposal) {
    return data?.proposal;
  }
  throw new Error(errors?.[0]?.message || 'Unknown server error');
}

const useGetProposal = (hash?: string) => {
  return useQuery(['gov', 'proposal', hash], async () => fetchProposals(hash), {
    enabled: Boolean(hash),
    staleTime: 3.6e6, // 1hour
  });
};

const Index: React.FC<ProposalProps> = ({ onBack }) => {
  const router = useRouter();

  const hash = router && router.query.panel ? router.query?.panel[1] : undefined;
  const proposalQuery = useGetProposal(hash);
  const proposal = proposalQuery.data;

  return (
    <Grid>
      <Col>{hash && <Content proposal={proposal} onBack={onBack} />}</Col>
      <Col>
        <Details proposal={proposal} />
        {hash && <Info proposalId={hash} />}
      </Col>
    </Grid>
  );
};

export default Index;
