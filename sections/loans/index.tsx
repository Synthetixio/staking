import Connector from 'containers/Connector';
import React from 'react';

import styled from 'styled-components';

import { FlexDivCol } from 'styles/common';
import media from 'styles/media';

import ActionBox from './components/ActionBox/ActionBox';
import InfoBox from './components/InfoBox/InfoBox';

const Index: React.FC = () => {
  const { isAppReady } = Connector.useContainer();

  return !isAppReady ? null : (
    <Container>
      <Col>
        <ActionBox />
      </Col>
      <Col>
        <InfoBox />
      </Col>
    </Container>
  );
};

const Container = styled.div`
  ${media.greaterThan('mdUp')`
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-gap: 1rem;
  `}

  ${media.lessThan('mdUp')`
    display: flex;
    flex-direction: column;
  `}
`;

const Col = styled(FlexDivCol)``;

export default Index;
