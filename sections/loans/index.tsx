import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { Row, FlexDivCol } from 'styles/common';
import { ACTION_BOX_WIDTH, INFO_BOX_WIDTH } from './constants';
import ActionBox from './components/ActionBox/ActionBox';
import InfoBox from './components/InfoBox/InfoBox';

const Index: React.FC = () => {
	const router = useRouter();
	const defaultTab = (router.query.action && router.query.action[0]) || 'new';

	return (
		<Row>
			<ActionBoxCol>
				<ActionBox currentTab={defaultTab} />
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
