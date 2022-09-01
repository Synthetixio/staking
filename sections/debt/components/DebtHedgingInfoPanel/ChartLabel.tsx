import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

type ChartLabelProps = {
  labelColor: string;
  labelBorderColor: string;
};

type ChartLabelIconProps = {
  color: string;
  borderColor: string;
};

const ChartLabel: React.FC<PropsWithChildren<ChartLabelProps>> = ({
  labelColor,
  labelBorderColor,
  children,
}) => {
  return (
    <FlexDivCentered>
      <ChartLabelIcon color={labelColor} borderColor={labelBorderColor} />
      <ChartLabelText>{children}</ChartLabelText>
    </FlexDivCentered>
  );
};

const ChartLabelIcon = styled.div<ChartLabelIconProps>`
  height: 10px;
  width: 10px;
  background-color: ${(props) => props.color};
  margin-right: 10px;
  border: 2px solid ${(props) => props.borderColor};
`;

const ChartLabelText = styled.span`
  font-size: 12px;
  font-family: ${(props) => props.theme.fonts.extended};
`;

export default ChartLabel;
