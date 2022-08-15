import styled from 'styled-components';
import { FlexDivColCentered, ErrorMessage as BaseErrorMessage } from 'styles/common';
import media from 'styles/media';

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

  ${media.lessThan('mdUp')`
    display: flex;
    flex-direction: column;
  `}
`;

export const InputsDivider = styled.div`
  background: #161b44;
  height: 92px;
  width: 1px;

  ${media.lessThan('mdUp')`
    display: none;
  `}
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

export const TxModalContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
`;

export const TxModalItem = styled.div`
  text-align: center;
  padding: 16px 0px;
  flex: 1;
`;

export const TxModalItemSeperator = styled.div`
  background: ${(props) => props.theme.colors.grayBlue};
  width: 1px;
  height: 100px;
`;
