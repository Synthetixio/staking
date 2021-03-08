import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { SPACE_KEY } from 'constants/snapshot';
import useProposals from 'queries/gov/useProposals';
import { getCurrentTimestampSeconds } from 'utils/formatters/date';

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
				const timestampSecondsNow = getCurrentTimestampSeconds();
				govProposals.data.forEach((proposal) => {
					if (
						proposal.msg.payload.end > timestampSecondsNow &&
						proposal.msg.payload.start < timestampSecondsNow
					) {
						count++;
					}
				});
				councilProposals.data.forEach((proposal) => {
					if (
						proposal.msg.payload.end > timestampSecondsNow &&
						proposal.msg.payload.start < timestampSecondsNow
					) {
						count++;
					}
				});

				ambassadorProposal.data.forEach((proposal) => {
					if (
						proposal.msg.payload.end > timestampSecondsNow &&
						proposal.msg.payload.start < timestampSecondsNow
					) {
						count++;
					}
				});

				grantsProposals.data.forEach((proposal) => {
					if (
						proposal.msg.payload.end > timestampSecondsNow &&
						proposal.msg.payload.start < timestampSecondsNow
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
