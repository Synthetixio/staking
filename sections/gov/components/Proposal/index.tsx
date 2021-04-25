import React from 'react';
import { Grid, Col } from 'sections/gov/components/common';
import Content from './Content';
import DilutionContent from './DilutionContent';
import Info from './Info';
import useActiveTab from 'sections/gov/hooks/useActiveTab';
import { SPACE_KEY } from 'constants/snapshot';

type ProposalProps = {
	onBack: Function;
};

const Index: React.FC<ProposalProps> = ({ onBack }) => {
	const activeTab = useActiveTab();
	return (
		<Grid>
			<Col>
				{activeTab === SPACE_KEY.PROPOSAL ? (
					<DilutionContent onBack={onBack} />
				) : (
					<Content onBack={onBack} />
				)}
			</Col>
			<Col>
				<Info />
			</Col>
		</Grid>
	);
};
export default Index;
