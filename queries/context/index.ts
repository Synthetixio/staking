import React from 'react';
import type { Signer } from 'ethers';
import type { Provider } from '@ethersproject/providers';
import type { NetworkId } from '@synthetixio/contracts-interface';
import type { SubgraphEndpoints } from 'queries/subgraphEndpoints';

export interface QueryContext {
	networkId: NetworkId | null;
	provider: Provider | null;
	signer: Signer | null;
	subgraphEndpoints: SubgraphEndpoints;
}

export const SynthetixQueryContext = React.createContext<QueryContext | null>(null);
