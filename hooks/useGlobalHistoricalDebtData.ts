import { useEffect, useState } from 'react';
import { orderBy } from 'lodash';
import useSynthetixQueries from '@synthetixio/queries';
import { StakingTransactionType } from '@synthetixio/queries';
import { useQuery } from 'react-query';
import axios from 'axios';
import Wei from '@synthetixio/wei';

type HistoricalGlobalDebtAndIssuanceData = {
	mirrorPool: {
		value: number;
		timestamp: number;
	};
	debtPool: {
		value: number;
		timestamp: number;
	};
};

type HistoricalGlobalDebtAndIssuance = {
	isLoading: boolean;
	data: HistoricalGlobalDebtAndIssuanceData[];
};

interface DHedgePerformanceResponse {
	data: {
		performanceHistory: {
			history: {
				performance: string;
				timestamp: string;
			}[];
		};
	};
	errors: any[];
}

const useGlobalHistoricalDebtData = () => {
	const [historicalDebt, setHistoricalDebt] = useState<HistoricalGlobalDebtAndIssuance>({
		isLoading: true,
		data: [],
	});

	const dhedgeData = useQuery<DHedgePerformanceResponse>(
		['dhedge', 'https://api-v2.dhedge.org/graphql'],
		async () => {
			const response = await axios({
				url: 'https://api-v2.dhedge.org/graphql',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				data: {
					query: `{
							performanceHistory (address:"0x65bb99e80a863e0e27ee6d09c794ed8c0be47186", period:"1m") {
								history {
									performance,
									timestamp
							}
						}
					}`,
				},
			});
			return response.data;
		},
		{
			refetchInterval: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
		}
	);

	const { issuance } = useSynthetixQueries();
	const dailyIssued = issuance.useGetDailyIssueds(
		{ orderBy: 'id', orderDirection: 'desc' },
		{ id: true, totalDebt: true }
	);
	const dailyBurned = issuance.useGetDailyBurneds(
		{ orderBy: 'id', orderDirection: 'desc' },
		{ id: true, totalDebt: true }
	);
	const isLoaded =
		dailyIssued.isSuccess &&
		dailyBurned.isSuccess &&
		dhedgeData.isSuccess &&
		!dhedgeData.data.errors?.length &&
		dhedgeData.data;

	useEffect(() => {
		if (isLoaded) {
			const dhedgeHistory = dhedgeData
				.data!.data.performanceHistory.history.map((history) => ({
					...history,
					performance: Number(history.performance) * 100,
					// we are getting the timestamps in milliseconds while our data is in seconds
					id: String(Number(history.timestamp) / 1000),
				}))
				.filter((history) => history.performance);
			const dailyIssuedData = dailyIssued.data ?? [];
			const dailyBurnedData = dailyBurned.data ?? [];
			// We concat both the events and order them (asc)
			const eventBlocks: Array<
				| {
						type: StakingTransactionType;
						id: string;
						value: Wei;
						totalDebt: Wei;
				  }
				| {
						performance: number;
						id: string;
				  }
			> = orderBy(
				dailyIssuedData
					.map((x) => ({ ...x, type: StakingTransactionType.Issued }))
					.concat(dailyBurnedData.map((x) => ({ ...x, type: StakingTransactionType.Burned })))
					// merge the dhedgeHistory with our data
					// @ts-ignore
					.concat(dhedgeHistory),
				'id',
				'asc'
			);
			let firstIndexOfDHedgeInformation: number = 0;
			for (let index = 0; index < eventBlocks.length; index++) {
				if (!firstIndexOfDHedgeInformation && 'performance' in eventBlocks[index]) {
					// We want to begin the graph with the debt pool line, that is why we do -1
					firstIndexOfDHedgeInformation = index - 1;
					break;
				}
			}

			const trimmedEventBlocks = eventBlocks.slice(
				firstIndexOfDHedgeInformation - 1,
				eventBlocks.length - 1
			);
			const data: HistoricalGlobalDebtAndIssuanceData[] = [];
			let lastKnownDebtPoolPrice = new Wei(0);
			let lastKnownPerformance = new Wei(0);
			trimmedEventBlocks.forEach((event) => {
				if ('totalDebt' in event) {
					lastKnownDebtPoolPrice = event.totalDebt;
					data.push({
						mirrorPool: {
							value: event.totalDebt.add(lastKnownPerformance).toNumber(),
							timestamp: Number(event.id),
						},
						debtPool: { timestamp: Number(event.id), value: event.totalDebt.toNumber() },
					});
				} else if ('performance' in event) {
					const percentageOf = lastKnownDebtPoolPrice.mul(event.performance).div(100);
					lastKnownPerformance = percentageOf;
					data.push({
						mirrorPool: {
							value: lastKnownDebtPoolPrice.add(percentageOf).toNumber(),
							timestamp: Number(event.id),
						},
						debtPool: { timestamp: Number(event.id), value: lastKnownDebtPoolPrice.toNumber() },
					});
				}
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
