import { useQuery, UseQueryOptions } from 'react-query';
import Connector from 'containers/Connector';

function getEndpoint(networkName: String) {
	switch (networkName) {
		case 'kovan-ovm':
			return 'https://api.thegraph.com/subgraphs/name/noisekit/liquidator-optimism-kovan';
		case 'mainnet-ovm':
			return 'https://api.thegraph.com/subgraphs/name/noisekit/liquidator-optimism';
		default:
			return null;
	}
}

const gql = (data: any) => data[0];
const query = gql`
	query stakerEntity($id: String!) {
		stakerEntity(id: $id) {
			id
			timestamp
			status
		}
	}
`;

export async function fetchLiquidationInfo(
	walletAddress: string | null,
	networkName: string | undefined
) {
	if (!walletAddress) {
		return null;
	}
	if (!networkName) {
		return null;
	}
	const endpoint = getEndpoint(networkName);
	if (!endpoint) {
		return null;
	}

	const body = await fetch(endpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify({
			query,
			variables: {
				id: walletAddress,
			},
		}),
	});

	const { data, errors } = await body.json();
	if (errors?.[0]) {
		throw new Error(errors?.[0]?.message || 'Unknown server error');
	}
	return data?.stakerEntity;
}

export function useLiquidationOptimismInfo(queryOptions?: UseQueryOptions) {
	const { walletAddress, network } = Connector.useContainer();
	return useQuery(
		[walletAddress, network?.name],
		() => fetchLiquidationInfo(walletAddress, network?.name),
		{
			enabled: Boolean(walletAddress && network?.name),
			...queryOptions,
		}
	);
}

export function useLiquidationOptimismSubgraph(queryOptions?: UseQueryOptions) {
	const { data, isSuccess } = useLiquidationOptimismInfo(queryOptions);
	if (!isSuccess) {
		return 0;
	}
	// @ts-ignore I give up
	return data?.status === 'FLAGGED' ? parseInt(data.timestamp, 10) * 1000 : 0;
}
