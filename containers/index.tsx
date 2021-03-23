import { FC, ReactNode } from 'react';

import Connector from './Connector';
import BlockExplorer from './BlockExplorer';
import TransactionNotifier from './TransactionNotifier';

type WithAppContainersProps = {
	children: ReactNode;
};

export const WithAppContainers: FC<WithAppContainersProps> = ({ children }) => (
	<Connector.Provider>
		<BlockExplorer.Provider>
			<TransactionNotifier.Provider>{children}</TransactionNotifier.Provider>
		</BlockExplorer.Provider>
	</Connector.Provider>
);

export default WithAppContainers;
