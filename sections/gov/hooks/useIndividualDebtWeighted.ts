import { useEffect, useState } from 'react';
import { quadraticWeighting } from 'constants/snapshot';
import { toBigNumber } from 'utils/formatters/number';
import useDebtOwnership from 'queries/gov/useDebtOwnership';

export const useIndividualDebtWeighted = (block?: number | null) => {
	const [individualDebtWeighted, setIndividualDebtWeighted] = useState<number | null>(null);
	const votingWeight = useDebtOwnership(block);

	useEffect(() => {
		const getIndividualWeightedDebt = () => {
			const individualDebtWeighted = Number(
				quadraticWeighting(votingWeight?.data ? votingWeight.data : toBigNumber(0))
			);
			setIndividualDebtWeighted(individualDebtWeighted);
		};

		getIndividualWeightedDebt();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [block, votingWeight]);

	return individualDebtWeighted;
};

export default useIndividualDebtWeighted;
