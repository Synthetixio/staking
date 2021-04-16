import { useEffect, useState } from 'react';
import { orderBy } from 'lodash';
import useDailyIssuedQuery from 'queries/staking/useDailyIssuedQuery';
import useDailyBurnedQuery from 'queries/staking/useDailyBurnedQuery';
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

const useGlobalHistoricalDebtData = () => {
	const [historicalDebt, setHistoricalDebt] = useState<HistoricalGlobalDebtAndIssuance>({
		isLoading: true,
		data: [],
	});

	const issuedQuery = useDailyIssuedQuery();
	const burnedQuery = useDailyBurnedQuery();

	const isLoaded = issuedQuery.isSuccess && burnedQuery.isSuccess;

	useEffect(() => {
		if (isLoaded) {
			const issued = issuedQuery.data ?? [];
			const burned = burnedQuery.data ?? [];

			// We concat both the events and order them (asc)
			const eventBlocks = orderBy(burned.concat(issued), 'timestamp', 'asc');

			const data: HistoricalGlobalDebtAndIssuanceData[] = [];

			eventBlocks.forEach((event, i) => {
				const multiplier = event.type === StakingTransactionType.Burned ? -1 : 1;
				const aggregation =
					data.length === 0 ? event.totalDebt : multiplier * event.value + data[i - 1].issuance;

				data.push({
					issuance: aggregation,
					debtPool: event.totalDebt,
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
