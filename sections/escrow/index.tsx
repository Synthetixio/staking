import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { Row, FlexDivCol } from 'styles/common';
import EscrowTable from './components/EscrowTable';
import useEscrowDataQuery from 'queries/escrow/useEscrowDataQuery';

const Index: FC = () => {
	// @TODO: refactor to a hook that is shared in index.ts and this component
	const escrowDataQuery = useEscrowDataQuery();
	const escrowData = escrowDataQuery?.data;

	return (
		<Row>
			<Column>
				<EscrowTable data={escrowData?.schedule ?? []} isLoaded={!escrowDataQuery.isLoading} />
			</Column>
			<Column></Column>
		</Row>
	);
};

const Column = styled(FlexDivCol)`
	width: ${BOX_COLUMN_WIDTH}px;
`;

export default Index;
