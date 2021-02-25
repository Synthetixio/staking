import styled from 'styled-components';
import { FlexDivColCentered } from 'styles/common';

export const FormContainer = styled(FlexDivColCentered)`
	justify-content: space-between;
	background: ${(props) => props.theme.colors.black};
	position: relative;
	width: 100%;
	padding: 16px;
	margin-bottom: 24px;
`;

export const InputsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1px 1fr;
	align-items: center;
`;

export const InputsDivider = styled.div`
	background: #161b44;
	height: 92px;
	width: 1px;
`;

export const SettingsContainer = styled.div`
	width: 100%;
	margin-bottom: 16px;
`;

export const SettingContainer = styled.div`
	border-bottom: ${(props) => `1px solid ${props.theme.colors.grayBlue}`};
`;
