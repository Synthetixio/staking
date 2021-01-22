import { FC } from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import { GridDiv } from 'styles/common';
import media from 'styles/media';
import useEscrowDataQuery from 'hooks/useEscrowDataQueryWrapper';

import { isWalletConnectedState } from 'store/wallet';
import { isLayerOneState } from 'store/chain';

import { WelcomeLayout, LayoutLayer1, LayoutLayer2, L1MigrationLayout } from './Layouts';

const PossibleActions: FC = () => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isLayer1 = useRecoilValue(isLayerOneState);
	const rewardEscrowQuery = useEscrowDataQuery();
	const totalBalancePendingMigration = rewardEscrowQuery?.data?.totalBalancePendingMigration ?? 0;

	const LayerLayout = isLayer1 ? LayoutLayer1 : LayoutLayer2;

	return (
		<PossibleActionsContainer>
			{isWalletConnected ? (
				totalBalancePendingMigration ? (
					<L1MigrationLayout />
				) : (
					<LayerLayout />
				)
			) : (
				<WelcomeLayout />
			)}
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
