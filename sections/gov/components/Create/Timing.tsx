import React from 'react';
import styled from 'styled-components';
import { Card, DataRow, Subtitle } from '../common';
import { useTranslation } from 'react-i18next';
import { Input } from 'components/Input/Input';

type TimingProps = {
  setBlock: Function;
  block: number | null;
};

const Timing: React.FC<TimingProps> = ({ setBlock, block }) => {
  const { t } = useTranslation();
  return (
    <StyledCard hasHelper={true}>
      <DataRow>
        <Subtitle>{t('gov.create.block')}</Subtitle>
        <BlockInput value={block ?? 0} onChange={(e) => setBlock(e.target.value)} type="number" />
      </DataRow>
      <DataRow>
        <Helper>{t('gov.create.helper')}</Helper>
      </DataRow>
    </StyledCard>
  );
};
export default Timing;

const StyledCard = styled(Card)<{ hasHelper: boolean }>`
  height: ${(props) => (props.hasHelper ? '125px' : '225px')};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const BlockInput = styled(Input)`
  background-color: ${(props) => props.theme.colors.navy};
  font-size: 12px;
  font-family: ${(props) => props.theme.fonts.extended};
  width: 100px;
`;

const Helper = styled.div`
  font-size: 12px;
  font-family: ${(props) => props.theme.fonts.interBold};
  color: ${(props) => props.theme.colors.gray};
  text-align: center;
`;
