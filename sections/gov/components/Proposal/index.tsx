import React from 'react';
import { Grid, Col } from 'sections/gov/components/common';
import DilutionContent from './DilutionContent';
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
	const router = useRouter();

	const hash = router && router.query.panel ? router.query?.panel[1] : undefined;
	const proposalQuery = useGetProposal(hash);
	const proposal = proposalQuery.data;

	return (
		<Grid>
			<Col>{hash && <DilutionContent proposal={proposal} onBack={onBack} />}</Col>
			<Col>
				<Details proposal={proposal} />
				{hash && <Info proposalId={hash} />}
			</Col>
		</Grid>
	);
};

export default Index;
