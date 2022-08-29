import styled from 'styled-components';
import Button from 'components/Button';
import { StyledInput } from '../../../staking/components/common';

export const StyledBackgroundTab = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background-color: ${(props) => props.theme.colors.black};
  padding: 16px;
`;
export const StyledBalance = styled.div`
  text-transform: none;
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  font-family: ${(props) => props.theme.fonts.condensedMedium};
`;
export const StyledHedgeInput = styled(StyledInput)`
  margin-top: 0;
  width: 350px;
`;

export const StyledCryptoCurrencyBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  font-size: 12px;
  margin-top: 14px;
  color: ${(props) => props.theme.colors.white};
  background-color: ${(props) => props.theme.colors.navy};
  border: 1px solid ${(props) => props.theme.colors.grayBlue};
  padding: 4px;
  text-transform: none;
  margin-left: 8px;
  width: 85px;
`;

export const StyledCryptoCurrencyImage = styled.img`
  width: 24px;
  height: 24px;
`;

export const StyledButton = styled(Button)`
  width: 100%;
  margin-top: 16px;
  align-self: flex-end;
  text-transform: none;
`;

export const StyledSpacer = styled.div`
  border-bottom: 1px solid ${(props) => props.theme.colors.mutedBlue};
  width: 300px;
  margin: 16px;
`;

export const StyledMaxButton = styled(Button)`
  margin-left: 16px;
  line-height: 0px;
  height: 20px;
`;

export const StyledInputLabel = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: baseline;
  font-size: 14px;
  width: 180px;
  font-family: Inter;
`;
export const PoweredByContainer = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
  font-size: 9px;
  width: 100%;
`;
export const TorosLogo = styled.img`
  height: 12px;
  margin-left: 10px;
`;
export const InputWrapper = styled.div`
  margin-top: 16px;
`;
