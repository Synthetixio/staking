import React from 'react';
import { Row } from 'styles/common';
import { RightCol, LeftCol } from 'sections/gov/components/common';
import Content from './Content';
import Info from './Info';

type ProposalProps = {
	onBack: Function;
};

const Index: React.FC<ProposalProps> = ({ onBack }) => {
	return (
		<Row>
			<LeftCol>
				<Content onBack={onBack} />
			</LeftCol>
			<RightCol>
				<Info />
			</RightCol>
		</Row>
	);
};
export default Index;
