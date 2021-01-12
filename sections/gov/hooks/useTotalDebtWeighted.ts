import { useEffect, useState } from 'react';
import useTotalIssuedSynthsExcludingEtherQuery from 'queries/synths/useTotalIssuedSynthsExcludingEtherQuery';
import { quadraticWeighting } from 'constants/snapshot';
import synthetix from 'lib/synthetix';
import { toBigNumber } from 'utils/formatters/number';

export const useTotalDebtWeighted = (block?: number | null) => {
	const [totalDebtWeighted, setTotalDebtWeighted] = useState<number | null>(null);
	const totalSynthDebt = useTotalIssuedSynthsExcludingEtherQuery('sUSD', block);

	const {
		utils: { formatUnits },
	} = synthetix.js!;

	useEffect(() => {
		const getWeightedTotalDebt = () => {
			console.log(totalSynthDebt);
			setTotalDebtWeighted(
				Number(
					quadraticWeighting(
						toBigNumber(totalSynthDebt?.data ? totalSynthDebt.data.toString() : '0')
					)
				)
			);
		};

		getWeightedTotalDebt();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [block]);

	return totalDebtWeighted;
};

export default useTotalDebtWeighted;
