import { useQuery, UseQueryOptions } from 'react-query';
import Connector from 'containers/Connector';

function getEndpoint(networkName: String) {
	switch (networkName) {
		case 'kovan-ovm':
			return 'https://api.thegraph.com/subgraphs/name/noisekit/liquidator-optimism-kovan';
		case 'mainnet-ovm':
			return 'https://api.thegraph.com/subgraphs/name/noisekit/liquidator-optimism';
		default:
			throw Error(`Called with unsupported network: ${networkName}`);
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

type StakerEntity = {
	id: string;
	timestamp: string;
	status: string;
} | null;

export async function fetchLiquidationInfo(walletAddress: string, networkName: string) {
	const endpoint = getEndpoint(networkName);

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

	const {
		errors,
		data,
	}: {
		errors?: Error[];
		data: { stakerEntity: StakerEntity };
	} = await body.json();

	if (errors?.[0]) {
		throw new Error(errors?.[0]?.message || 'Unknown server error');
	}
	return data?.stakerEntity;
}

export function useLiquidationOptimismInfo(queryOptions?: UseQueryOptions<StakerEntity>) {
	const { walletAddress, network } = Connector.useContainer();
	return useQuery(
		[walletAddress, network?.name],
		() => {
			if (!walletAddress || !network?.name) {
				throw Error('Missing address or network, query should not run without it');
			}
			return fetchLiquidationInfo(walletAddress, network?.name);
		},
		{
			enabled: Boolean(walletAddress && network?.name),
			...queryOptions,
		}
	);
}

export function useLiquidationOptimismSubgraph(queryOptions?: UseQueryOptions<StakerEntity>) {
	const { data, isSuccess } = useLiquidationOptimismInfo(queryOptions);
	if (!isSuccess) {
		return 0;
	}
	return data?.status === 'FLAGGED' ? parseInt(data.timestamp, 10) * 1000 : 0;
}
