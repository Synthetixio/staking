import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { SPACE_KEY } from 'constants/snapshot';
import useProposals from 'queries/gov/useProposals';

export const useActiveProposalCount = () => {
	const [activeCount, setActiveCount] = useState<number | null>(null);
	const isAppReady = useRecoilValue(appReadyState);
	const govProposals = useProposals(SPACE_KEY.PROPOSAL);

	useEffect(() => {
		const getCount = async () => {
			if (isAppReady && govProposals.data) {
				let count = 0;
				govProposals.data.forEach((proposal) => {
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
	}, [govProposals, isAppReady]);

	return activeCount;
};

export default useActiveProposalCount;
