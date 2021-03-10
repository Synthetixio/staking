import { FC } from 'react';
import { useRecoilValue } from 'recoil';

import styled from 'styled-components';
import { appReadyState } from 'store/app';
import Connector from 'containers/Connector';
import { Row, FlexDivCol } from 'styles/common';
import { LEFT_COL_WIDTH, RIGHT_COL_WIDTH } from 'sections/delegate/constants';
import LeftCol from 'sections/delegate/LeftCol';
import RightCol from 'sections/delegate/RightCol';

const Index: FC = () => {
	const isAppReady = useRecoilValue(appReadyState);
	const { signer } = Connector.useContainer();

	return !(isAppReady && signer) ? null : (
		<Row>
			<LeftColCol>
				<LeftCol />
			</LeftColCol>
			<RightColCol>
				<RightCol />
			</RightColCol>
		</Row>
	);
};

const LeftColCol = styled(FlexDivCol)`
	width: ${LEFT_COL_WIDTH}px;
`;

const RightColCol = styled(FlexDivCol)`
	width: ${RIGHT_COL_WIDTH}px;
`;

export default Index;
