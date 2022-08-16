import { FC } from 'react';
import styled from 'styled-components';

import { FlexDivCol } from 'styles/common';
import media from 'styles/media';

import DelegateForm from 'sections/delegate/DelegateForm';
import DelegateTable from 'sections/delegate/DelegateTable';
import Connector from 'containers/Connector';

const Index: FC = () => {
  const { isAppReady } = Connector.useContainer();

  return !isAppReady ? null : (
    <Container>
      <Col>
        <DelegateForm />
      </Col>
      <Col>
        <DelegateTable />
      </Col>
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-gap: 1rem;

  ${media.lessThan('mdUp')`
    display: flex;
    flex-direction: column;
  `}
`;

const Col = styled(FlexDivCol)``;

export default Index;
