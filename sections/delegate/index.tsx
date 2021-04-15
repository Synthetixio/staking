import { FC } from 'react';
import { useRecoilValue } from 'recoil';

import styled from 'styled-components';
import { appReadyState } from 'store/app';
import { Row, FlexDivCol } from 'styles/common';
import { FORM_COL_WIDTH, TABLE_COL_WIDTH } from 'sections/delegate/constants';
import Form from 'sections/delegate/Form';
import Table from 'sections/delegate/Table';

const Index: FC = () => {
	const isAppReady = useRecoilValue(appReadyState);

	return !isAppReady ? null : (
		<Row>
			<FormCol>
				<Form />
			</FormCol>
			<TableCol>
				<Table />
			</TableCol>
		</Row>
	);
};

const FormCol = styled(FlexDivCol)`
	width: ${FORM_COL_WIDTH}px;
`;

const TableCol = styled(FlexDivCol)`
	width: ${TABLE_COL_WIDTH}px;
`;

export default Index;
