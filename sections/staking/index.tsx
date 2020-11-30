import { FC } from 'react';
import styled from 'styled-components';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { Row, FlexDivCol } from 'styles/common';
import InfoBox from './components/InfoBox';
import ActionBox from './components/ActionBox';
import Staking from './context/StakingContext';

const Index: FC = () => {
	return (
		<Staking.Provider>
			<Row>
				<ActionBox />
				<InfoBoxWrap>
					<InfoBox />
				</InfoBoxWrap>
			</Row>
		</Staking.Provider>
	);
};

const InfoBoxWrap = styled(FlexDivCol)`
	width: ${BOX_COLUMN_WIDTH}px;
`;

export default Index;
