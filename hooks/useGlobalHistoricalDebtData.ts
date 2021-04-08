import { useEffect, useState } from 'react';
import { orderBy } from 'lodash';
import useGlobalSynthIssuedQuery from 'queries/staking/useGlobalSynthIssuedQuery';
import useGlobalSynthBurnedQuery from 'queries/staking/useGlobalSynthBurnedQuery';
import { StakingTransactionType } from 'queries/staking/types';

type HistoricalGlobalDebtAndIssuanceData = {
	issuance: number;
	debtPool: number;
	timestamp: number;
};

type HistoricalGlobalDebtAndIssuance = {
	isLoading: boolean;
	data: HistoricalGlobalDebtAndIssuanceData[];
};

const useGlobalHistoricalDebtData = (global = false) => {
	const [historicalDebt, setHistoricalDebt] = useState<HistoricalGlobalDebtAndIssuance>({
		isLoading: true,
		data: [],
	});

	// Only get data from within past year
	const now = new Date();
	now.setFullYear(now.getFullYear() - 1);
	const timestamp = Math.floor(now.getTime() / 1000);
	console.log(timestamp);

	const issuedQuery = useGlobalSynthIssuedQuery(timestamp);
	const burnedQuery = useGlobalSynthBurnedQuery(timestamp);

	const isLoaded = issuedQuery.isSuccess && burnedQuery.isSuccess;

	useEffect(() => {
		if (isLoaded) {
			const issued = issuedQuery.data ?? [];
			const burned = burnedQuery.data ?? [];

			console.log(issued.length, burned.length);

			// We concat both the events and order them (asc)
			const eventBlocks = orderBy(burned.concat(issued), 'timestamp', 'asc');

			const data: HistoricalGlobalDebtAndIssuanceData[] = [];

			eventBlocks.forEach((event, i) => {
				const multiplier = event.type === StakingTransactionType.Burned ? -1 : 1;
				const aggregation =
					data.length === 0
						? multiplier * event.value
						: multiplier * event.value + data[i - 1].issuance;

				data.push({
					issuance: aggregation,
					debtPool: event.totalIssuedSUSD,
					timestamp: event.timestamp,
				});
			});

			setHistoricalDebt({
				isLoading: false,
				data,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoaded]);

	return historicalDebt;
};

export default useGlobalHistoricalDebtData;
