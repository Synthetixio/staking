import React, { FC, useState } from 'react';
import styled from 'styled-components';

import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { Row, FlexDivCol } from 'styles/common';

import useEscrowDataQuery from 'queries/escrow/useEscrowDataQuery';

import ActionBox from './components/ActionBox';
import EscrowTable from './components/EscrowTable';

export enum EscrowPanelType {
	STAKING = 'staking',
	ICO = 'ico',
}

const Index: FC = () => {
	const [panelType, setPanelType] = useState<EscrowPanelType>(EscrowPanelType.STAKING);
	// @TODO: refactor to a hook that is shared in index.ts and this component
	const escrowDataQuery = useEscrowDataQuery();
	const escrowData = escrowDataQuery?.data;

	return (
		<Row>
			<Column>
				<EscrowTable data={escrowData?.schedule ?? []} isLoaded={!escrowDataQuery.isLoading} />
			</Column>
			<Column>
				<ActionBox
					canVestAmount={escrowData?.canVest ?? 0}
					isLoaded={!escrowDataQuery.isLoading}
					setPanelType={setPanelType}
				/>
			</Column>
		</Row>
	);
};

const Column = styled(FlexDivCol)`
	width: ${BOX_COLUMN_WIDTH}px;
`;

export default Index;
