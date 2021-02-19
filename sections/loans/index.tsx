import React from 'react';
import styled from 'styled-components';

import { Row, FlexDivCol } from 'styles/common';
import { ACTION_BOX_WIDTH, INFO_BOX_WIDTH } from './constants';
import ActionBox from './components/ActionBox/ActionBox';
import InfoBox from './components/InfoBox/InfoBox';

const Index: React.FC = () => {
	return (
		<Row>
			<ActionBoxCol>
				<ActionBox />
			</ActionBoxCol>
			<InfoBoxCol>
				<InfoBox />
			</InfoBoxCol>
		</Row>
	);
};

const ActionBoxCol = styled(FlexDivCol)`
	width: ${ACTION_BOX_WIDTH}px;
`;

const InfoBoxCol = styled(FlexDivCol)`
	width: ${INFO_BOX_WIDTH}px;
`;

export default Index;
