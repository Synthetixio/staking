import { FC, ReactNode } from 'react';

import Connector from './Connector';
import Etherscan from './Etherscan';
import Notify from './Notify';

type WithAppContainersProps = {
	children: ReactNode;
};

export const WithAppContainers: FC<WithAppContainersProps> = ({ children }) => (
	<Connector.Provider>
		<Etherscan.Provider>
			<Notify.Provider>{children}</Notify.Provider>
		</Etherscan.Provider>
	</Connector.Provider>
);

export default WithAppContainers;
