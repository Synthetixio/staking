import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import QUERY_KEYS from 'constants/queryKeys';

import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';
import { AuthoriserWallet } from './types';

const ENDPOINT = 'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix-delegation';

const useGetDelegateWallets = (options?: QueryConfig<[AuthoriserWallet]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const isL2 = useRecoilValue(isL2State);

	return useQuery<[AuthoriserWallet]>(
		QUERY_KEYS.Delegate.AuthorisedWallets(walletAddress ?? '', network?.id!),
		async () => {
			const { delegatedWallets } = await request(
				ENDPOINT,
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
			return delegatedWallets.map(
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
			enabled: isAppReady && !isL2,
			...options,
			refetchInterval: false,
			refetchIntervalInBackground: false,
		}
	);
};

export default useGetDelegateWallets;
