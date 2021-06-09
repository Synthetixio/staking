import { useEffect, useState } from 'react';
import { quadraticWeighting } from 'sections/gov/components/helper';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import useSynthetixQueries from '@synthetixio/queries';
import { networkState } from 'store/wallet';

export const useTotalDebtWeighted = (block?: number | null) => {
	const [totalDebtWeighted, setTotalDebtWeighted] = useState<number | null>(null);
	const networkId = useRecoilValue(networkState)!.id;
	const { useTotalIssuedSynthsExcludingEtherQuery } = useSynthetixQueries({ networkId });
	const totalSynthDebt = useTotalIssuedSynthsExcludingEtherQuery('sUSD', block);
	const isAppReady = useRecoilValue(appReadyState);

	useEffect(() => {
		const getWeightedTotalDebt = () => {
			if (isAppReady && totalSynthDebt.data) {
				const totalDebtWeighted = Number(quadraticWeighting(totalSynthDebt.data));
				setTotalDebtWeighted(totalDebtWeighted);
			}
		};

		getWeightedTotalDebt();
	}, [totalSynthDebt, isAppReady]);

	return totalDebtWeighted;
};

export default useTotalDebtWeighted;
