import { FC } from 'react';
import styled from 'styled-components';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { Row, FlexDivCol } from 'styles/common';
import { useRouter } from 'next/router';
import { GovPanelType } from 'store/gov';
import Panel from 'sections/gov/components/Panel';

const Index: FC = () => {
	const router = useRouter();
	const defaultTab = (router.query.action && router.query.action[0]) || GovPanelType.COUNCIL;

	console.log(defaultTab);

	return (
		<Row>
			<Cols>
				<Panel currentTab={defaultTab} />
			</Cols>
			<Cols>{/* <InfoBox currentTab={defaultTab} /> */}</Cols>
		</Row>
	);
};

const Cols = styled(FlexDivCol)`
	width: ${BOX_COLUMN_WIDTH}px;
`;

export default Index;
