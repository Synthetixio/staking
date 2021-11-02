import { useEffect, useState } from 'react';
import { orderBy } from 'lodash';
import { issuance, SynthetixQueryContext } from '@synthetixio/queries';
import { StakingTransactionType } from '@synthetixio/queries';
import React from 'react';

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

	const issuanceURL =
		React.useContext(SynthetixQueryContext)?.context.subgraphEndpoints.issuance || '';
	const dailyIssued = issuance.useGetDailyIssueds(
		issuanceURL,
		{ orderBy: 'id', orderDirection: 'desc' },
		{ id: true, totalDebt: true }
	);
	const dailyBurned = issuance.useGetDailyBurneds(
		issuanceURL,
		{ orderBy: 'id', orderDirection: 'desc' },
		{ id: true, totalDebt: true }
	);

	const isLoaded = dailyIssued.isSuccess && dailyBurned.isSuccess;

	useEffect(() => {
		if (isLoaded) {
			const activity = [dailyIssued.data ?? [], dailyBurned.data ?? []];

			// We concat both the events and order them (asc)
			const eventBlocks = orderBy((activity[0] as any).concat(activity[1]), 'id', 'asc');

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
