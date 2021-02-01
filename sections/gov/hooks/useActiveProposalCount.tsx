import { useEffect, useState } from 'react';
import useGovernanceProposals from 'queries/gov/useGovernanceProposals';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';

export const useActiveProposalCount = () => {
	const [activeCount, setActiveCount] = useState<number | null>(null);
	const isAppReady = useRecoilValue(appReadyState);
	const govProposals = useGovernanceProposals();

	useEffect(() => {
		const getCount = async () => {
			if (isAppReady && govProposals.data) {
				let count = 0;
				govProposals.data.map((proposal) => {
					console.log(proposal);
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
