import React from 'react';
import { Grid, Col } from 'sections/gov/components/common';
import Content from './Content';
import DilutionContent from './DilutionContent';
import useActiveTab from 'sections/gov/hooks/useActiveTab';
import { SPACE_KEY } from 'constants/snapshot';
import { proposalState } from 'store/gov';
import { useRecoilValue } from 'recoil';
import Details from './Details';
import Info from './Info';
import { useQuery } from 'react-query';
import { snapshotEndpoint } from 'constants/snapshot';
import request, { gql } from 'graphql-request';
import { useRouter } from 'next/router';
import { Proposal as ProposalType } from '@synthetixio/queries';

type ProposalProps = {
	onBack: Function;
};

const useGetProposal = (hash?: string) => {
	return useQuery(
		['gov', 'proposal', hash],
		async () => {
			const { proposal }: { proposal: ProposalType } = await request(
				snapshotEndpoint,
				gql`
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
				`,
				{ id: hash }
			);
			return proposal;
		},
		{
			enabled: Boolean(hash),
			staleTime: 3.6e6, // 1hour
		}
	);
};
const Index: React.FC<ProposalProps> = ({ onBack }) => {
	const { activeTab } = useActiveTab();
	const router = useRouter();

	const hash = router && router.query.panel ? router.query?.panel[1] : undefined;
	const proposalQuery = useGetProposal(hash);
	const proposal = proposalQuery.data;
	if (!proposal) return <></>;
	return (
		<Grid>
			<Col>
				{activeTab === SPACE_KEY.PROPOSAL ? (
					<DilutionContent {...{ proposal }} onBack={onBack} />
				) : (
					<Content {...{ proposal }} onBack={onBack} />
				)}
			</Col>
			<Col>
				<Details {...{ proposal }} />
				<Info {...{ proposal }} />
			</Col>
		</Grid>
	);
};
export default Index;
