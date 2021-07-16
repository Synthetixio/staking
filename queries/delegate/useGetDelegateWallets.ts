import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import QUERY_KEYS from 'constants/queryKeys';

import { appReadyState } from 'store/app';
import { isMainnetState, networkState, walletAddressState } from 'store/wallet';
import { DelegationWallet } from './types';
import { DELEGATE_GRAPH_ENDPOINT } from './constants';

const useGetDelegateWallets = (options?: QueryConfig<[DelegationWallet]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const isMainnet = useRecoilValue(isMainnetState);

	return useQuery<[DelegationWallet]>(
		QUERY_KEYS.Delegate.DelegateWallets(walletAddress ?? '', network?.id!),
		async () => {
			const { delegatedWallets } = await request(
				DELEGATE_GRAPH_ENDPOINT,
				gql`
					query getDelegateWallets($authoriser: String) {
						delegatedWallets(first: 100, where: { authoriser: $authoriser }) {
							delegate
							canMint
							canBurn
							canClaim
							canExchange
						}
					}
				`,
				{
					authoriser: walletAddress,
				}
			);

			return delegatedWallets
				.filter(
					({
						canMint,
						canBurn,
						canClaim,
						canExchange,
					}: {
						canMint: boolean;
						canBurn: boolean;
						canClaim: boolean;
						canExchange: boolean;
					}) => canMint || canBurn || canClaim || canExchange
				)
				.map(
					({
						delegate,
						canMint,
						canBurn,
						canClaim,
						canExchange,
					}: {
						delegate: string;
						canMint: boolean;
						canBurn: boolean;
						canClaim: boolean;
						canExchange: boolean;
					}) => ({
						address: delegate,
						canAll: canMint && canBurn && canClaim && canExchange,
						canMint,
						canBurn,
						canClaim,
						canExchange,
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

export default useGetDelegateWallets;
