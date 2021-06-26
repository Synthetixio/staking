import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { SPACE_KEY, snapshotEndpoint } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { Proposal } from './types';
import { networkState, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import { ethers } from 'ethers';
import CouncilDilution from 'contracts/councilDilution.js';
import CouncilNominations from 'constants/nominations.json';
import request, { gql } from 'graphql-request';

const useProposalsQuery = (spaceKey: SPACE_KEY, options?: QueryConfig<Proposal[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { provider } = Connector.useContainer();

	const isL1 = !network?.useOvm ?? true;

	const contract = new ethers.Contract(
		CouncilDilution.address,
		CouncilDilution.abi,
		provider as any
	);

	return useQuery<Proposal[]>(
		QUERY_KEYS.Gov.Proposals(spaceKey, walletAddress ?? '', network?.id!),
		async () => {
			const { proposals }: { proposals: Proposal[] } = await request(
				snapshotEndpoint,
				gql`
					query ProposalsForSpace($spaceKey: String) {
						proposals(
							first: 10
							where: { space: $spaceKey }
							orderBy: "created"
							orderDirection: desc
						) {
							id
							title
							body
							choices
							start
							end
							snapshot
							state
							author
							space {
								id
								name
							}
						}
					}
				`,
				{ spaceKey: spaceKey }
			);

			const proposalHashes = proposals.map((e: Proposal) => e.id);
			let validHashes: string[];

			if (spaceKey === SPACE_KEY.PROPOSAL) {
				const hashes = (await contract.getValidProposals(proposalHashes)) as string[];
				validHashes = hashes.filter((e) => e !== '').map((hash) => hash);
			} else if (spaceKey === SPACE_KEY.COUNCIL) {
				const nominationHashes = Object.keys(CouncilNominations);
				validHashes = proposalHashes
					.filter((e) => nominationHashes.includes(e))
					.map((hash) => hash);
			} else {
				validHashes = proposalHashes;
			}

			const mappedProposals = proposals.map(async (proposal) => {
				if (validHashes.includes(proposal.id)) {
					return {
						...proposal,
					};
				} else {
					return null;
				}
			});
			const resolvedProposals = await Promise.all(mappedProposals);
			return resolvedProposals.filter((e) => e !== null) as Proposal[];
		},
		{
			enabled: isAppReady && spaceKey && isL1,
			refetchInterval: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			...options,
		}
	);
};

export default useProposalsQuery;
