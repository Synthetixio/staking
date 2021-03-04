import React from 'react';
import { Row } from 'styles/common';
import { RightCol, LeftCol } from 'sections/gov/components/common';
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
		<Row>
			<LeftCol>
				{activeTab === SPACE_KEY.PROPOSAL ? (
					<DilutionContent onBack={onBack} />
				) : (
					<Content onBack={onBack} />
				)}
			</LeftCol>
			<RightCol>
				<Info />
			</RightCol>
		</Row>
	);
};
export default Index;
