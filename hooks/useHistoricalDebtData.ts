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
			orderDirection: 'desc',
			where: { account: walletAddress?.toLowerCase() },
		},
		{ timestamp: true, debtBalanceOf: true }
	);

	const debtDataQuery = useGetDebtDataQuery(walletAddress);

	const isLoaded =
		issues.isSuccess && burns.isSuccess && debtSnapshot.isSuccess && debtDataQuery.isSuccess;

	if (!isLoaded) {
		return { isLoading: false, data: [] };
	}
	let issuesAndBurns = issues.data!.map((b) => ({ isBurn: false, ...b }));
	issuesAndBurns = sortBy(
		issuesAndBurns.concat(burns.data!.map((b) => ({ isBurn: true, ...b }))),
		(d) => d.timestamp.toNumber()
	);

	const debtHistory = debtSnapshot.data ?? [];

	// We set historicalIssuanceAggregation array, to store all the cumulative
	// values of every mint and burns
	const historicalIssuanceAggregation: Wei[] = [];

	issuesAndBurns.slice().forEach((event) => {
		const multiplier = event.isBurn ? -1 : 1;
		const aggregation = event.value
			.mul(multiplier)
			.add(last(historicalIssuanceAggregation) ?? wei(0));

		historicalIssuanceAggregation.push(aggregation);
	});

	// We merge both actual & issuance debt into an array
	let historicalDebtAndIssuance: HistoricalDebtAndIssuanceData[] = [];
	debtHistory
		.slice()
		.reverse()
		.forEach((debtSnapshot, i) => {
			historicalDebtAndIssuance.push({
				timestamp: debtSnapshot.timestamp.toNumber() * 1000,
				issuanceDebt: historicalIssuanceAggregation[i],
				actualDebt: wei(debtSnapshot.debtBalanceOf || 0),
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

	return { isLoading: false, data: historicalDebtAndIssuance };
};

export default useHistoricalDebtData;
