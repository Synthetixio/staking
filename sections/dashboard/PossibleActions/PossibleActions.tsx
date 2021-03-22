import { FC } from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import { GridDiv } from 'styles/common';
import media from 'styles/media';

import { isWalletConnectedState, networkState } from 'store/wallet';

import { WelcomeLayout, LayoutLayerOne, LayoutLayerTwo } from './Layouts';

const PossibleActions: FC = () => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const network = useRecoilValue(networkState);

	const isL2 = network?.useOvm ?? false;
	const Layout = isL2 ? LayoutLayerTwo : LayoutLayerOne;

	return (
		<PossibleActionsContainer>
			{isWalletConnected ? <Layout /> : <WelcomeLayout />}
		</PossibleActionsContainer>
	);
};

const PossibleActionsContainer = styled(GridDiv)`
	margin-top: 30px;
	justify-items: stretch;
	align-items: stretch;
	grid-template-columns: [col-1] 25% [col-2] 25% [col-3] 25% [col-4] 25% [col-5];
	grid-template-rows: [row-1] 33% [row-2] 33% [row-3] 33% [row-4];
	gap: 1rem;
	${media.lessThan('sm')`
		display: flex;
		flex-direction: column;
	`}
`;

export default PossibleActions;
