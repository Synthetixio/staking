import { FC } from 'react';
import styled from 'styled-components';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { Row, FlexDivCol } from 'styles/common';
import { useRouter } from 'next/router';
import { GovPanelType } from 'store/gov';
import Panel from 'sections/gov/components/Panel';
import CouncilBoard from './components/CouncilBoard';

const Index: FC = () => {
	const router = useRouter();
	const defaultTab = (router.query.panel && router.query.panel[0]) || GovPanelType.COUNCIL;
	return (
		<Row>
			<Cols>
				<Panel currentTab={defaultTab} />
			</Cols>
			<Cols>
				<CouncilBoard />
			</Cols>
		</Row>
	);
};

const Cols = styled(FlexDivCol)`
	width: ${BOX_COLUMN_WIDTH}px;
`;

export default Index;
