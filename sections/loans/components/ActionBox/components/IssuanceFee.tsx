import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { formatPercent } from 'utils/formatters/number';
import Loans from 'containers/Loans';

const IssuanceFee: React.FC = () => {
  const { t } = useTranslation();
  const { issueFeeRate } = Loans.useContainer();

  return (
    <Container>
      <Header>{t('loans.issuance-fee')}</Header>
      <FlexDivRowCentered>
        <Item>
          <Text>{formatPercent(issueFeeRate)}</Text>
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
  cursor: pointer;
  svg {
    margin-left: 5px;
  }
`;

export default IssuanceFee;
