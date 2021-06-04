import React from 'react';
import styled from 'styled-components';

import { FlexDivCol } from 'styles/common';
import media from 'styles/media';

import ActionBox from './ActionBox';
import InfoBox from './InfoBox';

const Index: React.FC = () => {
	return (
		<Container>
			<Col>
				<ActionBox />
			</Col>
			<Col>
				<InfoBox />
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
