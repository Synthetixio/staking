import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import QUERY_KEYS from 'constants/queryKeys';

import { appReadyState } from 'store/app';
import { isMainnetState, networkState, walletAddressState } from 'store/wallet';
import { DelegationWallet } from './types';
import { DELEGATE_GRAPH_ENDPOINT } from './constants';

const useGetAuthoriserWallets = (options?: QueryConfig<[DelegationWallet]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const isMainnet = useRecoilValue(isMainnetState);

	return useQuery<[DelegationWallet]>(
		QUERY_KEYS.Delegate.AuthoriserWallets(walletAddress ?? '', network?.id!),
		async () => {
			const { delegatedWallets } = await request(
				DELEGATE_GRAPH_ENDPOINT,
				gql`
					query getAuthoriserWallets($delegate: String) {
						delegatedWallets(first: 100, where: { delegate: $delegate }) {
							authoriser
							canMint
							canBurn
							canClaim
						}
					}
				`,
				{
					delegate: walletAddress,
				}
			);

			return delegatedWallets
				.filter(
					({
						canMint,
						canBurn,
						canClaim,
					}: {
						canMint: boolean;
						canBurn: boolean;
						canClaim: boolean;
					}) => canMint || canBurn || canClaim
				)
				.map(
					({
						authoriser,
						canMint,
						canBurn,
						canClaim,
					}: {
						authoriser: string;
						canMint: boolean;
						canBurn: boolean;
						canClaim: boolean;
					}) => ({
						address: authoriser,
						canMint,
						canBurn,
						canClaim,
					})
				);
		},
		{
			enabled: isAppReady && isMainnet && walletAddress,
			...options,
			refetchInterval: false,
			refetchIntervalInBackground: false,
		}
	);
};

export default useGetAuthoriserWallets;
