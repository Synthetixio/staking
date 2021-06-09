import { useEffect, useState } from 'react';
import { quadraticWeighting } from 'sections/gov/components/helper';
import useDebtOwnership from 'queries/gov/useDebtOwnership';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { wei } from '@synthetixio/wei';

export const useIndividualDebtWeighted = (block?: number | null) => {
	const [individualDebtWeighted, setIndividualDebtWeighted] = useState<number | null>(null);
	const votingWeight = useDebtOwnership(block);
	const isAppReady = useRecoilValue(appReadyState);

	useEffect(() => {
		const getIndividualWeightedDebt = () => {
			if (isAppReady) {
				const individualDebtWeighted = Number(
					quadraticWeighting(votingWeight?.data ? votingWeight.data : wei(0))
				);
				setIndividualDebtWeighted(individualDebtWeighted);
			}
		};

		getIndividualWeightedDebt();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [block, votingWeight, isAppReady]);

	return individualDebtWeighted;
};

export default useIndividualDebtWeighted;
