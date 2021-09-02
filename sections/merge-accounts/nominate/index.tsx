import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { appReadyState } from 'store/app';
import { FlexDivCol } from 'styles/common';
import media from 'styles/media';

import ActionBox from './NominateActionBox';
import InfoBox from './NominateInfoBox';

const Nominate: FC = () => {
	const isAppReady = useRecoilValue(appReadyState);

	return !isAppReady ? null : (
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

export default Nominate;
