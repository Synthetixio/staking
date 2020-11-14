import { FC, ReactNode } from 'react';

import Connector from './Connector';
import Etherscan from './Etherscan';

type WithAppContainersProps = {
	children: ReactNode;
};

export const WithAppContainers: FC<WithAppContainersProps> = ({ children }) => (
	<Connector.Provider>
		<Etherscan.Provider>{children}</Etherscan.Provider>
	</Connector.Provider>
);

export default WithAppContainers;
