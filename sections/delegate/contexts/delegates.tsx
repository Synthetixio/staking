import {
	// useMemo, useEffect,
	useState,
	createContext,
	useContext,
	ReactNode,
} from 'react';
// import { useRecoilValue } from 'recoil';
// import { ethers } from 'ethers';
// import Big from 'bignumber.js';

// import Connector from 'containers/Connector';
// import { appReadyState } from 'store/app';
// import synthetix from 'lib/synthetix';
// import { walletAddressState, networkState } from 'store/wallet';
// import { toBig } from 'utils/formatters/big-number';

import { Delegate } from 'queries/delegates/types';

type Context = {
	delegates: Delegate[];
	isLoadingDelegates: boolean;
};

const DelegatesContext = createContext<Context | null>(null);

type DelegatesProviderProps = {
	children: ReactNode;
};

export const DelegatesProvider: React.FC<DelegatesProviderProps> = ({ children }) => {
	// const { provider, signer } = Connector.useContainer();
	// const address = useRecoilValue(walletAddressState);
	// const network = useRecoilValue(networkState);
	// const isAppReady = useRecoilValue(appReadyState);

	const [isLoadingDelegates, setIsLoadingDelegates] = useState(false);
	const [delegates, setDelegates] = useState<Array<Delegate>>([]);

	return (
		<DelegatesContext.Provider
			value={{
				delegates,
				isLoadingDelegates,
			}}
		>
			{children}
		</DelegatesContext.Provider>
	);
};

export function useDelegates() {
	const context = useContext(DelegatesContext);
	if (!context) {
		throw new Error('Missing delegates context');
	}
	return context;
}
