import React from 'react';

import Connector from './Connector';

type WithStateContainersProps = {
	children: React.ReactNode;
};

export const WithStateContainers: React.FC<WithStateContainersProps> = ({ children }) => (
	<Connector.Provider>{children}</Connector.Provider>
);

export default WithStateContainers;
