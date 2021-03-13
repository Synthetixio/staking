import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import axios from 'axios';

import QUERY_KEYS from 'constants/queryKeys';
import { SPACE, PROPOSAL, SPACE_KEY, PROPOSALS } from 'constants/snapshot';

import { appReadyState } from 'store/app';
import { Proposal, SpaceData } from './types';
import { networkState, walletAddressState } from 'store/wallet';
import snapshot from '@snapshot-labs/snapshot.js';
import Connector from 'containers/Connector';
import { ethers } from 'ethers';
import CouncilDilution from 'contracts/councilDilution.js';

const useProposals = (spaceKey: SPACE_KEY, options?: QueryConfig<Proposal[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { provider } = Connector.useContainer();

	const contract = new ethers.Contract(
		CouncilDilution.address,
		CouncilDilution.abi,
		provider as any
	);

	return useQuery<any[]>(
		QUERY_KEYS.Gov.Proposals(spaceKey, walletAddress ?? '', network?.id!),
		async () => {
			let [{ proposalHashes, proposalContent }, space]: [
				{
					proposalHashes: string[];
					proposalContent: Proposal[];
				},
				SpaceData
			] = await Promise.all([
				axios.get(PROPOSALS(spaceKey)).then((response) => {
					return {
						proposalHashes: Object.keys(response.data) as string[],
						proposalContent: Object.values(response.data) as Proposal[],
					};
				}),
				axios.get(SPACE(spaceKey)).then((response) => response.data),
			]);

			if (spaceKey === SPACE_KEY.PROPOSAL) {
				const hashes = (await contract.getValidProposals(proposalHashes)) as string[];
				const validHashes = hashes
					.filter((e: string) => e !== '')
					.map((hash) => hash.toLowerCase());
				const mappedProposals = proposalContent.map(async (proposal) => {
					if (validHashes.includes(proposal.authorIpfsHash.toLowerCase())) {
						const block = parseInt(proposal.msg.payload.snapshot);
						const currentBlock = provider?.getBlockNumber() ?? 0;
						const blockTag = block > currentBlock ? 'latest' : block;

						let { voterAddresses } = await Promise.resolve(
							axios.get(PROPOSAL(spaceKey, proposal.authorIpfsHash)).then((response) => {
								return {
									voterAddresses: Object.keys(response.data).map((address) =>
										address.toLowerCase()
									) as string[],
								};
							})
						);

						const [scores]: any = await Promise.all([
							snapshot.utils.getScores(
								spaceKey,
								space.strategies,
								space.network,
								provider,
								voterAddresses,
								blockTag
							),
						]);

						let voteCount = 0;

						space.strategies.forEach((_, i: number) => {
							let arrayOfVotes = Object.values(scores[i]) as number[];
							voteCount = voteCount + arrayOfVotes.filter((score: number) => score > 0).length;
						});

						return {
							...proposal,
							votes: voteCount,
						};
					} else {
						return null;
					}
				});
				const resolvedProposals = await Promise.all(mappedProposals);
				return resolvedProposals.filter((e) => e !== null);
			} else {
				const mappedProposals = proposalContent.map(async (proposal) => {
					const block = parseInt(proposal.msg.payload.snapshot);
					const currentBlock = provider?.getBlockNumber() ?? 0;
					const blockTag = block > currentBlock ? 'latest' : block;

					let { voterAddresses } = await Promise.resolve(
						axios.get(PROPOSAL(spaceKey, proposal.authorIpfsHash)).then((response) => {
							return {
								voterAddresses: Object.keys(response.data).map((address) =>
									address.toLowerCase()
								) as string[],
							};
						})
					);

					const [scores]: any = await Promise.all([
						snapshot.utils.getScores(
							spaceKey,
							space.strategies,
							space.network,
							provider,
							voterAddresses,
							blockTag
						),
					]);

					let voteCount = 0;

					space.strategies.forEach((_, i: number) => {
						let arrayOfVotes = Object.values(scores[i]) as number[];
						voteCount = voteCount + arrayOfVotes.filter((score: number) => score > 0).length;
					});

					return {
						...proposal,
						votes: voteCount,
					};
				});

				const resolvedProposals = await Promise.all(mappedProposals);
				return resolvedProposals;
			}
		},
		{
			enabled: isAppReady && spaceKey,
			...options,
		}
	);
};

export default useProposals;
