import { useEffect, useState } from 'react';
import useSynthIssuedQuery from 'queries/staking/useSynthIssuedQuery';
import useSynthBurnedQuery from 'queries/staking/useSynthBurnedQuery';
import useGetDebtSnapshotQuery from 'queries/debt/useGetDebtSnapshotQuery';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import { last, orderBy } from 'lodash';
import { toBigNumber } from 'utils/formatters/number';

export type HistoricalDebtAndIssuanceData = {
	timestamp: number;
	actualDebt: number;
	issuanceDebt: number;
	index: number;
};

type HistoricalDebtAndIssuance = {
	isLoading: boolean;
	data: HistoricalDebtAndIssuanceData[] | [];
};

const useHistoricalDebtData = () => {
	const [historicalDebt, setHistoricalDebt] = useState<HistoricalDebtAndIssuance>({
		isLoading: true,
		data: [],
	});

	const issuedQuery = useSynthIssuedQuery();
	const burnedQuery = useSynthBurnedQuery();
	const debtSnapshotQuery = useGetDebtSnapshotQuery();
	const debtDataQuery = useGetDebtDataQuery();

	const isLoaded =
		issuedQuery.isSuccess &&
		burnedQuery.isSuccess &&
		debtSnapshotQuery.isSuccess &&
		debtDataQuery.isSuccess;

	useEffect(() => {
		if (isLoaded) {
			const issued = issuedQuery.data ?? [];
			const burned = burnedQuery.data ?? [];
			const debtHistory = debtSnapshotQuery.data ?? [];

			const burnEventsMap = burned.map((event) => {
				return { ...event, type: 'burn' };
			});

			const issueEventsMap = issued.map((event) => {
				return { ...event, type: 'mint' };
			});

			// We concat both the events and order them (asc)
			const eventBlocks = orderBy(burnEventsMap.concat(issueEventsMap), 'block', 'asc');

			// We set historicalIssuanceAggregation array, to store all the cumulative
			// values of every mint and burns
			const historicalIssuanceAggregation: number[] = [];
			eventBlocks.forEach((event, i) => {
				const multiplier = event.type === 'burn' ? -1 : 1;
				const aggregation =
					historicalIssuanceAggregation.length === 0
						? multiplier * event.value
						: multiplier * event.value + historicalIssuanceAggregation[i - 1];

				historicalIssuanceAggregation.push(aggregation);
			});

			console.log(historicalIssuanceAggregation.length, debtHistory.length);

			// We merge both actual & issuance debt into an array
			let historicalDebtAndIssuance: HistoricalDebtAndIssuanceData[] = [];
			debtHistory
				.slice()
				.reverse()
				.forEach((debtSnapshot, i) => {
					historicalDebtAndIssuance.push({
						timestamp: debtSnapshot.timestamp,
						issuanceDebt: historicalIssuanceAggregation[i],
						actualDebt: debtSnapshot.debtBalanceOf,
						index: i,
					});
				});

			// Last occurrence is the current state of the debt
			// Issuance debt = last occurrence of the historicalDebtAndIssuance array
			historicalDebtAndIssuance.push({
				timestamp: new Date().getTime(),
				actualDebt: toBigNumber(debtDataQuery.data?.debtBalance ?? 0).toNumber(),
				issuanceDebt: last(historicalIssuanceAggregation) ?? 0,
				index: historicalDebtAndIssuance.length,
			});

			setHistoricalDebt({ isLoading: false, data: historicalDebtAndIssuance });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoaded]);

	return historicalDebt;
};

export default useHistoricalDebtData;
