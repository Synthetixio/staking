import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import { LineSpacer } from 'styles/common';

import DebtHistoryContainer from 'sections/history/DebtHistoryContainer';

import useSynthBurnedQuery from 'queries/staking/useSynthBurnedQuery';
import useSynthIssuedQuery from 'queries/staking/useSynthIssuedQuery';
import useDebtSnapshotHistoryQuery from 'queries/debt/useDebtSnapshotHistoryQuery';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useSynthBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { CryptoCurrency } from 'constants/currency';
const { SNX } = CryptoCurrency;


const DebtHistoryPage = () => {
	const { t } = useTranslation();
	const issuedQuery = useSynthIssuedQuery();
	const burnedQuery = useSynthBurnedQuery();
	const debtSnapshotHistoryQuery = useDebtSnapshotHistoryQuery();
	const getDebtDataQuery = useGetDebtDataQuery();
	const synthBalancesQuery = useSynthBalancesQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const isLoaded = issuedQuery.isSuccess && burnedQuery.isSuccess && debtSnapshotHistoryQuery.isSuccess && getDebtDataQuery.isSuccess && synthBalancesQuery.isSuccess && exchangeRatesQuery.isSuccess;

	const issued = issuedQuery.data ?? [];
	const burned = burnedQuery.data ?? [];
	const debtHistory = debtSnapshotHistoryQuery.data ?? [];
	const currentDebt = getDebtDataQuery.data ? getDebtDataQuery.data.debtBalance.toNumber() : 0;
	const synthBalances = synthBalancesQuery.data ?? null;

	return (
		<>
			<Head>
				<title>{t('debt-history.page-title')}</title>
			</Head>
			<LineSpacer />
			<DebtHistoryContainer
				burned={burned}
				issued={issued}
				debtHistory={debtHistory}
				currentDebt={currentDebt}
				synthBalances={synthBalances}
				isLoaded={isLoaded}
			/>
		</>
	);
};

export default DebtHistoryPage;
