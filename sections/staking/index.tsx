import { FC } from 'react';
import styled from 'styled-components';
import { FlexDivCol } from 'styles/common';
import { useRouter } from 'next/router';
import { StakingPanelType } from 'store/staking';
import media from 'styles/media';

import InfoBox from './components/InfoBox';
import ActionBox from './components/ActionBox';

const Index: FC = () => {
	const router = useRouter();
	const defaultTab = (router.query.action && router.query.action[0]) || StakingPanelType.MINT;

	return (
		<Container>
			<Cols>
				<ActionBox currentTab={defaultTab} />
			</Cols>
			<Cols>
				<InfoBox currentTab={defaultTab} />
			</Cols>
		</Container>
	);
};

const Container = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 1rem;

	${media.lessThan('mdUp')`
		display: flex;
		flex-direction: column;
	`}
`;

const Cols = styled(FlexDivCol)``;

export default Index;
