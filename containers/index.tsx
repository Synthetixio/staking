import { FC, ReactNode } from 'react';

import Connector from './Connector';
import BlockExplorer from './BlockExplorer';
import TransactionNotifier from './TransactionNotifier';
import Delegates from './Delegates';
import Loans from './Loans';
import SideNav from './UI';

type WithAppContainersProps = {
	children: ReactNode;
};

export const WithAppContainers: FC<WithAppContainersProps> = ({ children }) => (
	<Connector.Provider>
		<BlockExplorer.Provider>
			<TransactionNotifier.Provider>
				<Loans.Provider>
					<Delegates.Provider>
						<SideNav.Provider>{children}</SideNav.Provider>
					</Delegates.Provider>
				</Loans.Provider>
			</TransactionNotifier.Provider>
		</BlockExplorer.Provider>
	</Connector.Provider>
);

export default WithAppContainers;
