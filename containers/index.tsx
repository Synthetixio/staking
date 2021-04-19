import { FC, ReactNode } from 'react';

import Connector from './Connector';
import BlockExplorer from './BlockExplorer';
import TransactionNotifier from './TransactionNotifier';
import Delegates from './Delegates';
import Loans from './Loans';

type WithAppContainersProps = {
	children: ReactNode;
};

export const WithAppContainers: FC<WithAppContainersProps> = ({ children }) => (
	<Connector.Provider>
		<BlockExplorer.Provider>
			<TransactionNotifier.Provider>
				<Loans.Provider>
					<Delegates.Provider>{children}</Delegates.Provider>
				</Loans.Provider>
			</TransactionNotifier.Provider>
		</BlockExplorer.Provider>
	</Connector.Provider>
);

export default WithAppContainers;
