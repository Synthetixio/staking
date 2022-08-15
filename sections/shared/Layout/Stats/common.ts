import styled from 'styled-components';
import { FlexDivCentered, FlexDivCol, FlexDivRowCentered } from 'styles/common';

import ProgressBar from 'components/ProgressBar';

export const BarStatBox = styled(FlexDivCol)`
  width: 100%;
  margin-bottom: 35px;
  &:last-child {
    margin-bottom: 45px;
  }
`;

export const BarHeaderSection = styled(FlexDivRowCentered)``;

export const BarTitle = styled(FlexDivCentered)`
  font-size: 12px;
  font-family: ${(props) => props.theme.fonts.interBold};
  color: ${(props) => props.theme.colors.gray};
  text-transform: uppercase;
`;

export const BarValue = styled.span`
  font-size: 12px;
  color: ${(props) => props.theme.colors.white};
  font-family: ${(props) => props.theme.fonts.mono};
`;

export const StyledProgressBar = styled(ProgressBar)`
  height: 6px;
  margin: 10px 0;
`;
