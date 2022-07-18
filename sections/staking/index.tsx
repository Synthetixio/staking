import { FC } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

import { StakingPanelType } from 'store/staking';
import { FlexDivCol } from 'styles/common';
import media from 'styles/media';

import InfoBox from './components/InfoBox';
import ActionBox from './components/ActionBox';

const Index: FC = () => {
	const params = useParams();
	const action = params.action || '';
	// @ts-ignore
	const currentTab = Object.values(StakingPanelType).includes(action)
		? action
		: StakingPanelType.MINT;

	return (
		<Container>
			<Col>
				<ActionBox currentTab={currentTab} />
			</Col>
			<Col>
				<InfoBox currentTab={currentTab} />
			</Col>
		</Container>
	);
};

const Container = styled.div`
	display: grid;
	grid-template-columns: 2fr 1fr;
	grid-gap: 1rem;

	${media.lessThan('mdUp')`
		display: flex;
		flex-direction: column;
	`}
`;

const Col = styled(FlexDivCol)``;

export default Index;
