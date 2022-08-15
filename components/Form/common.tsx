import styled from 'styled-components';
import Button from 'components/Button';

export const FormLabel = styled.div`
  font-family: ${(props) => props.theme.fonts.condensedBold};
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 120%;
  text-transform: uppercase;
  color: ${(props) => props.theme.colors.gray};
`;

export const InputsDivider = styled.div`
  background: ${(props) => props.theme.colors.grayBlue};
  height: 92px;
  width: 1px;
`;

export const ButtonTransaction = styled(Button)`
  font-size: 14px;
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
  border-radius: 4px;
  width: 100%;
  text-transform: uppercase;
  &:disabled {
    box-shadow: none;
  }
`;
