import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import { GridDiv } from 'styles/common';
import media from 'styles/media';

import { isWalletConnectedState } from 'store/wallet';

import { WelcomeLayout, LayoutOne } from './Layouts';

const PossibleActions: FC = () => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	return (
		<PossibleActionsContainer>
			{isWalletConnected ? <LayoutOne /> : <WelcomeLayout />}
		</PossibleActionsContainer>
	);
};

const PossibleActionsContainer = styled(GridDiv)`
	margin-top: 30px;
	justify-items: stretch;
	align-items: stretch;
	grid-template-columns: [col-1] 25% [col-2] 25% [col-3] 25% [col-4] 25% [col-5];
	grid-template-rows: [row-1] 50% [row-2] 50% [row-3];
	gap: 1rem;
	${media.lessThan('sm')`
		display: flex;
		flex-direction: column;
	`}
`;

export default PossibleActions;
