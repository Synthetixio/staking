import { last } from 'lodash';
import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import sortBy from 'lodash/sortBy';

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

const useHistoricalDebtData = (walletAddress: string | null): HistoricalDebtAndIssuance => {
	const { useGetDebtDataQuery, subgraph } = useSynthetixQueries();

	const issues = subgraph.useGetIssueds(
		{
			first: 1000,
			orderBy: 'timestamp',
			orderDirection: 'desc',
			where: { account: walletAddress?.toLowerCase() },
		},
		{ timestamp: true, value: true }
	);
	const burns = subgraph.useGetBurneds(
		{
			first: 1000,
			orderBy: 'timestamp',
			orderDirection: 'desc',
			where: { account: walletAddress?.toLowerCase() },
		},
		{ timestamp: true, value: true }
	);

	const debtSnapshot = subgraph.useGetDebtSnapshots(
		{
			first: 1000,
			orderBy: 'timestamp',
			orderDirection: 'asc',
			where: { account: walletAddress?.toLowerCase() },
		},
		{ timestamp: true, debtBalanceOf: true }
	);

	const debtDataQuery = useGetDebtDataQuery(walletAddress);

	const isLoaded =
		issues.isSuccess && burns.isSuccess && debtSnapshot.isSuccess && debtDataQuery.isSuccess;

	if (!isLoaded) {
		return { isLoading: true, data: [] };
	}
	const issueData = issues.data || [];
	const burnData = burns.data || [];
	const issuesWithFlag = issueData.map((b) => ({ isBurn: false, ...b }));
	const burnWithFlag = burnData.map((b) => ({ isBurn: true, ...b }));
	const issuesAndBurns = sortBy(issuesWithFlag.concat(burnWithFlag), (d) => d.timestamp.toNumber());

	const debtHistory = debtSnapshot.data ?? [];

	// We set historicalIssuanceAggregation array, to store all the cumulative
	// values of every mint and burns
	const historicalIssuanceAggregation: Wei[] = [];

	issuesAndBurns.forEach((event) => {
		const multiplier = event.isBurn ? -1 : 1;
		const aggregation = event.value
			.mul(multiplier)
			.add(last(historicalIssuanceAggregation) ?? wei(0));

		historicalIssuanceAggregation.push(aggregation);
	});

	// We merge both actual & issuance debt into an array
	const historicalDebtAndIssuance: HistoricalDebtAndIssuanceData[] = debtHistory.map(
		(debtSnapshot, i) => {
			return {
				timestamp: debtSnapshot.timestamp.toNumber() * 1000,
				issuanceDebt: historicalIssuanceAggregation[i],
				actualDebt: wei(debtSnapshot.debtBalanceOf || 0),
				index: i,
			};
		}
	);

	if (historicalDebtAndIssuance.length > 0) {
		// Last occurrence is the current state of the debt
		// Issuance debt = last occurrence of the historicalDebtAndIssuance array
		// We only want this to happen if we have some history, so that we can display no data for accounts that never have staked
		historicalDebtAndIssuance.push({
			timestamp: new Date().getTime(),
			actualDebt: debtDataQuery.data?.debtBalance || wei(0),
			issuanceDebt: last(historicalIssuanceAggregation) ?? wei(0),
			index: historicalDebtAndIssuance.length,
		});
	}

	return { isLoading: false, data: historicalDebtAndIssuance };
};

export default useHistoricalDebtData;
