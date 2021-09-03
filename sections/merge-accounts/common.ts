import styled from 'styled-components';
import {
	FlexDivColCentered,
	ErrorMessage as BaseErrorMessage,
	FlexDivCol,
	FlexDivRowCentered,
} from 'styles/common';
import media from 'styles/media';
import Button from 'components/Button';

export const FormContainer = styled(FlexDivColCentered)`
	justify-content: space-between;
	background: ${(props) => props.theme.colors.black};
	position: relative;
	width: 100%;
	padding: 16px;
	margin-bottom: 24px;
`;

export const InputsContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
`;

export const SettingsContainer = styled.div`
	width: 100%;
	margin-bottom: 16px;
`;

export const SettingContainer = styled.div`
	border-bottom: ${(props) => `1px solid ${props.theme.colors.grayBlue}`};
`;

export const ErrorMessage = styled(BaseErrorMessage)`
	margin-top: 24px;
`;

export const TxModalItem = styled.div`
	text-align: center;
	padding: 16px 0px;
	flex: 1;
`;

export const Cols = styled.div`
	${media.greaterThan('mdUp')`
	display: grid;
	grid-template-columns: 3fr 2fr;
	grid-gap: 24px;
`}

	${media.lessThan('mdUp')`
	display: flex;
	flex-direction: column;
`}
`;

export const Col = styled(FlexDivCol)``;

export const FormHeader = styled(FlexDivRowCentered)`
	justify-content: space-between;
	width: 100%;
	padding: 8px;
`;

export const FormHeaderButton = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border-radius: 4px;
	width: 100%;
	text-transform: uppercase;
`;
