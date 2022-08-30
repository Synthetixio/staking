import React from 'react';
import styled from 'styled-components';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { formatPercent } from 'utils/formatters/number';
import Loans from 'containers/Loans';

const MinCRatio: React.FC = () => {
  const { minCRatio } = Loans.useContainer();

  return (
    <Container>
      <Header>Min C-Ratio</Header>
      <FlexDivRowCentered>
        <Item>
          <Text>{minCRatio && formatPercent(minCRatio)}</Text>
        </Item>
      </FlexDivRowCentered>
    </Container>
  );
};

const Container = styled(FlexDivRow)`
  width: 100%;
  justify-content: space-between;
`;

const Header = styled.p`
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  color: ${(props) => props.theme.colors.gray};
  text-transform: uppercase;
`;

const Text = styled.span`
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  color: ${(props) => props.theme.colors.white};
`;

const Item = styled.span`
  display: inline-flex;
  align-items: center;
`;

export default MinCRatio;
