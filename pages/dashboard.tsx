import Head from 'next/head';
import styled from 'styled-components';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { FlexDivCol } from 'styles/common';
import { formatPercent } from 'utils/formatters/number';
import { StatBoxes, BarStats, PossibleActions } from 'sections/dashboard';

import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useSNXBalanceQuery from 'queries/walletBalances/useSNXBalanceQuery';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useSNXTotalSupply from 'queries/network/useSNXTotalSupply';

const DashboardPage = () => {
	const { t } = useTranslation();

	const debtDataQuery = useGetDebtDataQuery();
	const snxBalanceQuery = useSNXBalanceQuery();

	// @TODO: Remove hardcoded claim value
	const claimed = true;

	const currentCRatio = debtDataQuery.data?.currentCRatio;
	const targetCRatio = debtDataQuery.data?.targetCRatio;
	const activeDebt = debtDataQuery.data?.debtBalance;
	const stakedValue = snxBalanceQuery.data?.balance
		? snxBalanceQuery.data.balance * Math.min(1, currentCRatio / targetCRatio)
		: 0;

	const currencyRates = useCurrencyRatesQuery(['SNX']);
	const exchangeRates = useExchangeRatesQuery();

	const currentFeePeriod = useGetFeePoolDataQuery('0');
	const previousFeePeriod = useGetFeePoolDataQuery('1');

	const ONE_WEEK_EPOCH = 604800;
	const nextFeePeriodStarts = currentFeePeriod.data?.startTime
		? currentFeePeriod.data.startTime + ONE_WEEK_EPOCH
		: 0;
	const hoursLeftInPeriod = (nextFeePeriodStarts - new Date().getTime() / 1000) / 60 / 60;

	const totalSNXSupplyQuery = useSNXTotalSupply();

	// @TODO: Find how to get these values
	// const percentLocked = snxLocked / snxTotal;
	// const percentLocked = 0.1;

	// const SNXValueStaked = totalSNXSupplyQuery?.data * percentLocked;

	// const stakingApy =
	// 	(((exchangeRates?.data['sUSD'] ?? 0) * currentFeePeriod?.data?.feesToDistribute +
	// 		(currencyRates?.data.SNX ?? 0) * currentFeePeriod?.data?.rewardsToDistribute) *
	// 		52) /
	// 	SNXValueStaked;

	// console.log(nextFeePeriod.data);

	// console.log(format(new Date(nextFeePeriod.data.?startTime), 'MMMM dd'));

	// console.log(new Date())
	// console.log(new Date(newFeePeriod.data?.startTime.sub(currentFeePeriod.data?.startTime)));
	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<Content>
				<StatBoxes activeDebt={activeDebt} stakedValue={stakedValue} />
				<BarStats
					currentCRatio={currentCRatio}
					targetCRatio={targetCRatio}
					claimed={claimed}
					hoursLeftInPeriod={hoursLeftInPeriod}
				/>
				<PossibleActions claimAmount={20} sUSDAmount={2000} SNXAmount={400} earnPercent={0.15} />
			</Content>
		</>
	);
};

const Content = styled(FlexDivCol)`
	justify-content: center;
	width: 100%;
`;

export default DashboardPage;
