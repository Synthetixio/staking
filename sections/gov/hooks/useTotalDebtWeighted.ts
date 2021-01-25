import { useEffect, useState } from 'react';
import useTotalIssuedSynthsExcludingEtherQuery from 'queries/synths/useTotalIssuedSynthsExcludingEtherQuery';
import { quadraticWeighting } from 'constants/snapshot';
import { toBigNumber } from 'utils/formatters/number';

export const useTotalDebtWeighted = (block?: number | null) => {
	const [totalDebtWeighted, setTotalDebtWeighted] = useState<number | null>(null);
	const totalSynthDebt = useTotalIssuedSynthsExcludingEtherQuery('sUSD', block);

	useEffect(() => {
		const getWeightedTotalDebt = () => {
			const totalDebtWeighted = Number(
				quadraticWeighting(toBigNumber(totalSynthDebt?.data ? totalSynthDebt.data.toString() : '0'))
			);
			setTotalDebtWeighted(totalDebtWeighted);
		};

		getWeightedTotalDebt();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [block, totalSynthDebt]);

	return totalDebtWeighted;
};

export default useTotalDebtWeighted;
