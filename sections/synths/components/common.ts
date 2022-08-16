import styled from 'styled-components';
import Button from 'components/Button';

export const StyledButton = styled(Button)`
  text-transform: uppercase;
  width: 120px;
`;

export const StyledButtonBlue = styled(StyledButton).attrs({ variant: 'secondary' })``;
export const StyledButtonPink = styled(StyledButton).attrs({ variant: 'tertiary' })``;
