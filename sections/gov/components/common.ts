import styled from 'styled-components';

import { FlexDivColCentered } from 'styles/common';

export const InputContainer = styled(FlexDivColCentered)`
	background: ${(props) => props.theme.colors.black};
	position: relative;
	width: 100%;
	height: 100%;
	padding: 16px;
	margin-bottom: 24px;
`;

export const Divider = styled.div`
	background: ${(props) => props.theme.colors.grayBlue};
	height: 1px;
	width: 100%;
	margin-top: 20px;
	margin-bottom: 20px;
`;
