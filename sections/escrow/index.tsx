import React from 'react';
import styled from 'styled-components';

import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { Row, FlexDivCol } from 'styles/common';

import ActionBox from './components/ActionBox';
import EscrowTable from './components/EscrowTable';
import { useRouter } from 'next/router';
import { EscrowPanelType } from 'store/escrow';

const Index: React.FC = () => {
	const router = useRouter();
	const defaultTab = (router.query.action && router.query.action[0]) || EscrowPanelType.REWARDS;

	return (
		<Row>
			<Cols>
				<ActionBox currentTab={defaultTab} />
			</Cols>
			<Cols>
				<EscrowTable />
			</Cols>
		</Row>
	);
};

const Cols = styled(FlexDivCol)`
	width: ${BOX_COLUMN_WIDTH}px;
`;

export default Index;
