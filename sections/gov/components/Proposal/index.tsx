import React from 'react';
import { Row } from 'styles/common';
import { RightCol, LeftCol } from 'sections/gov/components/common';
import Content from './Content';
import DilutionContent from './DilutionContent';
import Info from './Info';
import useActiveTab from 'sections/gov/hooks/useActiveTab';
import { SPACE_KEY } from 'constants/snapshot';
import { proposalState } from 'store/gov';
import { useRecoilValue } from 'recoil';
import Details from './Details';

type ProposalProps = {
	onBack: Function;
};

const Index: React.FC<ProposalProps> = ({ onBack }) => {
	const activeTab = useActiveTab();
	const proposal = useRecoilValue(proposalState);

	if (!proposal) return <></>;
	return (
		<Row>
			<LeftCol>
				{activeTab === SPACE_KEY.PROPOSAL ? (
					<DilutionContent proposal={proposal} onBack={onBack} />
				) : (
					<Content proposal={proposal} onBack={onBack} />
				)}
			</LeftCol>
			<RightCol>
				<Details proposal={proposal} />
				<Info proposal={proposal} />
			</RightCol>
		</Row>
	);
};
export default Index;
