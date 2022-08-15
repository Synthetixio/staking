import { FC } from 'react';
import Connector from 'containers/Connector';

import { Cols, Col } from 'sections/merge-accounts/common';
import ActionBox from './BurnActionBox';
import InfoBox from './BurnInfoBox';

const Burn: FC = () => {
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

export default Burn;
