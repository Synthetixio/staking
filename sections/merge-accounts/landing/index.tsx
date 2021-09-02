import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { appReadyState } from 'store/app';
import { FlexDivCol } from 'styles/common';
import media from 'styles/media';

import GridBox from './GridBox';

const Index: FC = () => {
	const isAppReady = useRecoilValue(appReadyState);

	return !isAppReady ? null : (
		<Container>
			<Col>
				<GridBox step={1} name={'nominate'} />
			</Col>
			<Col>
				<GridBox step={2} name={'merge'} />
			</Col>
		</Container>
	);
};

const Container = styled.div`
	${media.greaterThan('mdUp')`
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 24px;
	`}

	${media.lessThan('mdUp')`
		display: flex;
		flex-direction: column;
	`}
`;

const Col = styled(FlexDivCol)``;

export default Index;
