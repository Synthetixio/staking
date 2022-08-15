import React from 'react';
import styled from 'styled-components';

import { FlexDivCol } from 'styles/common';
import media from 'styles/media';

import ActionBox from './components/ActionBox';
import EscrowTable from './components/EscrowTable';
import { useRouter } from 'next/router';
import { EscrowPanelType } from 'store/escrow';

const Index: React.FC = () => {
  const router = useRouter();
  const defaultTab = (router.query.action && router.query.action[0]) || EscrowPanelType.REWARDS;

  return (
    <Container>
      <Col>
        <ActionBox currentTab={defaultTab} />
      </Col>
      <Col>
        <EscrowTable />
      </Col>
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;

  ${media.lessThan('mdUp')`
    display: flex;
    flex-direction: column;
  `}
`;

const Col = styled(FlexDivCol)``;

export default Index;
