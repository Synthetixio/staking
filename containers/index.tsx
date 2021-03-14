import { FC, ReactNode } from 'react';

import Connector from './Connector';
import Etherscan from './Etherscan';
import Notify from './Notify';
import TransactionNotifier from './TransactionNotifier';

type WithAppContainersProps = {
	children: ReactNode;
};

export const WithAppContainers: FC<WithAppContainersProps> = ({ children }) => (
	<Connector.Provider>
		<Etherscan.Provider>
			<Notify.Provider>
				<TransactionNotifier.Provider>{children}</TransactionNotifier.Provider>
			</Notify.Provider>
		</Etherscan.Provider>
	</Connector.Provider>
);

export default WithAppContainers;
