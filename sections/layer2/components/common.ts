import styled from 'styled-components';

import { FlexDivColCentered } from 'styles/common';

export const TabContainer = styled(FlexDivColCentered)`
	background: ${(props) => props.theme.colors.black};
	height: 100%;
	padding: 24px;
	position: relative;
`;
