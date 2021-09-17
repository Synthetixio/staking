import { useEffect, useState } from 'react';
import { last } from 'lodash';
import useSynthetixQueries from '@synthetixio/queries';
import { StakingTransactionType } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';

export type HistoricalDebtAndIssuanceData = {
	timestamp: number;
	actualDebt: Wei;
	issuanceDebt: Wei;
	index: number;
};

type HistoricalDebtAndIssuance = {
	isLoading: boolean;
	data: HistoricalDebtAndIssuanceData[] | [];
};

const useHistoricalDebtData = (walletAddress: string | null) => {
	const [historicalDebt, setHistoricalDebt] = useState<HistoricalDebtAndIssuance>({
		isLoading: true,
		data: [],
	});

	const {
		useFeeClaimHistoryQuery,
		useGetDebtSnapshotQuery,
		useGetDebtDataQuery,
	} = useSynthetixQueries();

	const feeClaimHistoryQuery = useFeeClaimHistoryQuery(walletAddress);

	const debtSnapshotQuery = useGetDebtSnapshotQuery(walletAddress);
	const debtDataQuery = useGetDebtDataQuery(walletAddress);

	const isLoaded =
		feeClaimHistoryQuery.isSuccess && debtSnapshotQuery.isSuccess && debtDataQuery.isSuccess;

	useEffect(() => {
		if (isLoaded) {
			const claimHistory = feeClaimHistoryQuery.data ?? [];
			const debtHistory = debtSnapshotQuery.data ?? [];

			// We set historicalIssuanceAggregation array, to store all the cumulative
			// values of every mint and burns
			const historicalIssuanceAggregation: Wei[] = [];
			claimHistory.forEach((event, i) => {
				if (event.type === StakingTransactionType.FeesClaimed) {
					return; // skip
				}

				const multiplier = event.type === StakingTransactionType.Burned ? -1 : 1;
				const aggregation =
					historicalIssuanceAggregation.length === 0
						? event.value.mul(multiplier)
						: event.value.mul(multiplier).add(last(historicalIssuanceAggregation)!);

				historicalIssuanceAggregation.push(aggregation);
			});

			// We merge both actual & issuance debt into an array
			let historicalDebtAndIssuance: HistoricalDebtAndIssuanceData[] = [];
			debtHistory
				.slice()
				.reverse()
				.forEach((debtSnapshot, i) => {
					historicalDebtAndIssuance.push({
						timestamp: debtSnapshot.timestamp,
						issuanceDebt: historicalIssuanceAggregation[i],
						actualDebt: wei(debtSnapshot.debtBalanceOf),
						index: i,
					});
				});

			// Last occurrence is the current state of the debt
			// Issuance debt = last occurrence of the historicalDebtAndIssuance array
			historicalDebtAndIssuance.push({
				timestamp: new Date().getTime(),
				actualDebt: debtDataQuery.data?.debtBalance || wei(0),
				issuanceDebt: last(historicalIssuanceAggregation) ?? wei(0),
				index: historicalDebtAndIssuance.length,
			});

			setHistoricalDebt({ isLoading: false, data: historicalDebtAndIssuance });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoaded]);

	return historicalDebt;
};

export default useHistoricalDebtData;
