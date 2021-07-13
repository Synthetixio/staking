import { FC } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { StakingPanelType } from 'store/staking';
import { FlexDivCol } from 'styles/common';
import media from 'styles/media';

import InfoBox from './components/InfoBox';
import ActionBox from './components/ActionBox';

const Index: FC = () => {
	const router = useRouter();
	const defaultTab = (router.query.action && router.query.action[0]) || StakingPanelType.MINT;

	return (
		<Container>
			<Col>
				<ActionBox currentTab={defaultTab} />
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
