import styled from 'styled-components';
import {
  FlexDivColCentered,
  ErrorMessage as BaseErrorMessage,
  FlexDivRowCentered,
  FlexDiv,
  FlexDivCol,
  FlexDivCentered,
  ExternalLink,
} from 'styles/common';
import media from 'styles/media';
import Button from 'components/Button';

export const TotalValueWrapper = styled(FlexDiv)`
  justify-content: space-between;
  height: 30px;
  align-items: center;
  border-bottom: 1px solid ${(props) => props.theme.colors.gray};
  width: 80%;
  margin-top: 15px;
`;

export const Subtext = styled.div`
  font-family: ${(props) => props.theme.fonts.interSemiBold};
  color: ${(props) => props.theme.colors.gray};
  font-size: 12px;
`;

export const Value = styled.div`
  font-size: 16px;
  font-family: ${(props) => props.theme.fonts.extended};
  color: ${(props) => props.theme.colors.white};
`;

export const Label = styled.p`
  margin: 0 auto;
  font-family: ${(props) => props.theme.fonts.interSemiBold};
  color: ${(props) => props.theme.colors.gray};
  font-size: 12px;
`;

export const HeaderLabel = styled(Label)`
  padding-bottom: 24px;
`;

export const StyledLink = styled(ExternalLink)`
  color: ${(props) => props.theme.colors.blue};
`;

export const Title = styled.div<{ isStakingPanel?: boolean }>`
  font-family: ${(props) => props.theme.fonts.extended};
  font-size: 12px;
  color: ${(props) => props.theme.colors.white};
  margin-bottom: ${(props) => (props.isStakingPanel ? '5px' : '20px')};
`;

const Header = styled.div`
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  line-height: 17px;
  margin-bottom: 5px;
`;

export const GreyHeader = styled(Header)`
  color: ${(props) => props.theme.colors.gray};
`;

export const WhiteSubheader = styled(Header)`
  color: ${(props) => props.theme.colors.white};
`;

export const GreyText = styled.div`
  color: ${(props) => props.theme.colors.gray};
  font-size: 12px;
  margin-bottom: 5px;
  text-align: center;
`;

export const LinkText = styled.div`
  font-size: 12px;
  color: ${(props) => props.theme.colors.blue};
`;

export const Divider = styled.div`
  background: ${(props) => props.theme.colors.grayBlue};
  height: 1px;
  margin-top: 20px;
  margin-bottom: 20px;

  ${media.greaterThan('mdUp')`
    width: 257px;
  `}
`;

export const StyledButton = styled(Button)`
  font-size: 14px;
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  width: 80%;
  text-transform: uppercase;
  height: 40px;
  background: ${(props) => props.theme.colors.blue};
`;

export const TabContainer = styled(FlexDivCol)`
  height: 100%;
  padding: 24px;
  position: relative;
`;

export const IconWrap = styled(FlexDivCentered)`
  width: 64px;
  height: 67px;
  justify-content: center;
`;

export const VerifyButton = styled.div<{ isStakingPanel?: boolean }>`
  width: ${(props) => (props.isStakingPanel ? '75px' : '125px')};
  height: 32px;
  padding-top: 8px;
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.black};
  color: ${(props) => props.theme.colors.white};
  border: 1px solid ${(props) => props.theme.colors.gray};
  box-shadow: none;
  text-transform: uppercase;
  text-align: center;
`;

export const DismissButton = styled(Button)<{ isStakingPanel?: boolean; autoWidth?: boolean }>`
  box-shadow: none;
`;
export const ButtonSpacer = styled(FlexDiv)<{ isStakingPanel?: boolean; autoWidth?: boolean }>`
  justify-content: space-between;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 12px;

  & > *:first-child {
    justify-self: right;
  }
`;

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

export const ActionsGrid = styled.div<{ single?: boolean }>`
  ${(props) =>
    props.single
      ? ''
      : `
      display: grid;
      grid-template-columns: 1fr 1fr;

      & > div:first-child {
        border-right: 1px solid ${props.theme.colors.grayBlue};
      }
  `}
  margin-bottom: -20px;
`;

export const ActionsGridBox = styled(FlexDivColCentered)`
  padding: 20px 30px;
`;
