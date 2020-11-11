import { useMemo } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import useSynthIssuedQuery from 'queries/staking/useSynthIssuedQuery';
import useSynthBurnedQuery from 'queries/staking/useSynthBurnedQuery';
import useFeeClaimHistoryQuery from 'queries/staking/useFeeClaimHistoryQuery';
import useWalletTradesQuery from 'queries/trades/useWalletTradesQuery';
import { orderBy } from 'lodash';

const HistoryPage = () => {
	const { t } = useTranslation();
	const issuedQuery = useSynthIssuedQuery();
	const burnedQuery = useSynthBurnedQuery();
	const tradesQuery = useWalletTradesQuery();
	const feesClaimedQuery = useFeeClaimHistoryQuery();

	const finishedLoadingTransactions =
		issuedQuery.isSuccess &&
		burnedQuery.isSuccess &&
		tradesQuery.isSuccess &&
		feesClaimedQuery.isSuccess;

	const allTransactions = useMemo(() => {
		return finishedLoadingTransactions
			? orderBy(
					[
						...(issuedQuery.data ?? []),
						...(burnedQuery.data ?? []),
						...(tradesQuery.data ?? []),
						...(feesClaimedQuery.data ?? []),
					],
					'timestamp',
					'desc'
			  )
			: [];
	}, [
		finishedLoadingTransactions,
		issuedQuery.data,
		burnedQuery.data,
		tradesQuery.data,
		feesClaimedQuery.data,
	]);

	console.log(allTransactions);

	return (
		<>
			<Head>
				<title>{t('history.page-title')}</title>
			</Head>
			<div>History</div>
		</>
	);
};

export default HistoryPage;
