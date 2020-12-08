import { FC } from 'react';
import styled from 'styled-components';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { Row, FlexDivCol } from 'styles/common';
import InfoBox from './components/InfoBox';
import ActionBox from './components/ActionBox';

const Index: FC = () => {
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
