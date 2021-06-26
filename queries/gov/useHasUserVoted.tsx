import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { snapshotEndpoint } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { walletAddressState } from 'store/wallet';
import request, { gql } from 'graphql-request';

const useHasVotedForElections = (electionHashes: string[], options?: QueryConfig<boolean>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<boolean>(
		QUERY_KEYS.Gov.HasVotedForElections(electionHashes, walletAddress ?? ''),
		async () => {
			try {
				const {
					votes: { votes },
				} = await request(
					snapshotEndpoint,
					gql`
						query HasVotedForElections($electionHashes: [String]!, $userAddress: String) {
							votes(
								space: $spaceKey
								strategies: $strategies
								network: $network
								addresses: $addresses
								snapshot: $snapshot
								where: { proposal_in: $electionHashes }
							) {
								scores
							}
						}
					`,
					{
						electionHash: electionHashes,
						userAddress: walletAddress,
					}
				);

				if (votes.length === 0) {
					return false;
				} else {
					return true;
				}
			} catch (error) {
				console.log(error);
				return true;
			}
		},
		{
			enabled: isAppReady && walletAddress,
			refetchInterval: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			...options,
		}
	);
};

export default useHasVotedForElections;
