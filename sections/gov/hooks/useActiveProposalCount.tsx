import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { SPACE_KEY } from 'constants/snapshot';
import useProposals from 'queries/gov/useProposals';

export const useActiveProposalCount = () => {
	const [activeCount, setActiveCount] = useState<number | null>(null);
	const isAppReady = useRecoilValue(appReadyState);
	const govProposals = useProposals(SPACE_KEY.PROPOSAL);
	const councilProposals = useProposals(SPACE_KEY.COUNCIL);
	const ambassadorProposal = useProposals(SPACE_KEY.AMBASSADOR);
	const grantsProposals = useProposals(SPACE_KEY.GRANTS);

	useEffect(() => {
		const getCount = async () => {
			if (
				isAppReady &&
				govProposals.data &&
				councilProposals.data &&
				ambassadorProposal.data &&
				grantsProposals.data
			) {
				let count = 0;
				govProposals.data.forEach((proposal) => {
					if (
						proposal.msg.payload.end > Date.now() / 1000 &&
						proposal.msg.payload.start < Date.now() / 1000
					) {
						count++;
					}
				});
				councilProposals.data.forEach((proposal) => {
					if (
						proposal.msg.payload.end > Date.now() / 1000 &&
						proposal.msg.payload.start < Date.now() / 1000
					) {
						count++;
					}
				});
				ambassadorProposal.data.forEach((proposal) => {
					if (
						proposal.msg.payload.end > Date.now() / 1000 &&
						proposal.msg.payload.start < Date.now() / 1000
					) {
						count++;
					}
				});
				grantsProposals.data.forEach((proposal) => {
					if (
						proposal.msg.payload.end > Date.now() / 1000 &&
						proposal.msg.payload.start < Date.now() / 1000
					) {
						count++;
					}
				});
				setActiveCount(count);
			}
		};
		getCount();
	}, [govProposals, isAppReady, councilProposals, grantsProposals, ambassadorProposal]);

	return activeCount;
};

export default useActiveProposalCount;
