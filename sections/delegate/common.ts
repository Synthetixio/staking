import styled from 'styled-components';
import { FlexDivColCentered, ErrorMessage as BaseErrorMessage } from 'styles/common';

export const FormContainer = styled(FlexDivColCentered)`
  justify-content: space-between;
  background: ${(props) => props.theme.colors.black};
  position: relative;
  width: 100%;
  padding: 16px;
  margin-bottom: 24px;
`;

export const InputsContainer = styled.div`
  align-items: center;
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
