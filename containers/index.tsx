import { FC, ReactNode } from 'react';

import Connector from './Connector';
import Etherscan from './Etherscan';

type WithStateContainersProps = {
	children: ReactNode;
};

export const WithStateContainers: FC<WithStateContainersProps> = ({ children }) => (
	<Connector.Provider>
		<Etherscan.Provider>{children}</Etherscan.Provider>
	</Connector.Provider>
);

export default WithStateContainers;
