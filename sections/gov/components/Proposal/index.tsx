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

type ProposalProps = {
	onBack: Function;
};

const Index: React.FC<ProposalProps> = ({ onBack }) => {
	const activeTab = useActiveTab();
	const proposal = useRecoilValue(proposalState);

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
