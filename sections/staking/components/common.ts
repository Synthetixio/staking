import styled from 'styled-components';

import { FlexDivColCentered } from 'styles/common';

export const TabContainer = styled(FlexDivColCentered)`
	background: ${(props) => props.theme.colors.darkBlue};
	height: 100%;
`;
