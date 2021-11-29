import { useEffect, useState } from 'react';
import { orderBy } from 'lodash';
import useSynthetixQueries from '@synthetixio/queries';
import { StakingTransactionType } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';

type HistoricalGlobalDebtAndIssuanceData = {
	issuance: number;
	debtPool: number;
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

	const { issuance } = useSynthetixQueries();
	const dailyIssued = issuance.useGetDailyIssueds(
		{ orderBy: 'id', orderDirection: 'desc' },
		{ id: true, totalDebt: true }
	);
	const dailyBurned = issuance.useGetDailyBurneds(
		{ orderBy: 'id', orderDirection: 'desc' },
		{ id: true, totalDebt: true }
	);
	const isLoaded = dailyIssued.isSuccess && dailyBurned.isSuccess;

	useEffect(() => {
		if (isLoaded) {
			const dailyIssuedData = dailyIssued.data ?? [];
			const dailyBurnedData = dailyBurned.data ?? [];
			// We concat both the events and order them (asc)
			const eventBlocks = orderBy(
				dailyIssuedData
					.map((x) => ({ ...x, type: StakingTransactionType.Issued }))
					.concat(dailyBurnedData.map((x) => ({ ...x, type: StakingTransactionType.Burned }))),
				'id',
				'asc'
			);

			const data: HistoricalGlobalDebtAndIssuanceData[] = [];

			eventBlocks.forEach((event, i) => {
				const multiplier = event.type === StakingTransactionType.Burned ? -1 : 1;
				const value = event.value ?? wei(0);
				const aggregation =
					data.length === 0 ? event.totalDebt : value.mul(multiplier).add(data[i - 1].issuance);

				data.push({
					issuance: aggregation.toNumber(),
					debtPool: event.totalDebt.toNumber(),
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
