import Connector from 'containers/Connector';
import { FC } from 'react';

import { Cols, Col } from 'sections/merge-accounts/common';
import ActionBox from './NominateActionBox';
import InfoBox from './NominateInfoBox';

const Nominate: FC = () => {
  const { isAppReady } = Connector.useContainer();

  return !isAppReady ? null : (
    <Cols>
      <Col>
        <ActionBox />
      </Col>
      <Col>
        <InfoBox />
      </Col>
    </Cols>
  );
};

export default Nominate;
