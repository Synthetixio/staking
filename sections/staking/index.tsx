import { FC } from 'react';
import styled from 'styled-components';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { Row, FlexDivCol } from 'styles/common';
import InfoBox from './components/InfoBox';
import ActionBox from './components/ActionBox';
import { useRouter } from 'next/router';
import { StakingPanelType } from 'store/staking';

const Index: FC = () => {
	const router = useRouter();
	const defaultTab = (router.query.action && router.query.action[0]) || StakingPanelType.MINT;

	return (
		<Row>
			<Cols>
				<ActionBox currentTab={defaultTab} />
			</Cols>
			<Cols>
				<InfoBox currentTab={defaultTab} />
			</Cols>
		</Row>
	);
};

const Cols = styled(FlexDivCol)`
	width: ${BOX_COLUMN_WIDTH}px;
`;

export default Index;
