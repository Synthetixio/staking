import React from 'react';
import styled from 'styled-components';

import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { Row, FlexDivCol } from 'styles/common';

import ActionBox from './ActionBox';
import InfoBox from './InfoBox';

const Index: React.FC = () => {
	return (
		<Row>
			<Cols>
				<ActionBox />
			</Cols>
			<Cols>
				<InfoBox />
			</Cols>
		</Row>
	);
};

const Cols = styled(FlexDivCol)`
	width: ${BOX_COLUMN_WIDTH}px;
`;

export default Index;
