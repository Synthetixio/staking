import React, { useMemo } from 'react';
import styled from 'styled-components';
import { FlexDivCol } from 'styles/common';
import StatBoxes from './StatBoxes';
import BarStats from './BarStats';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useSNXBalanceQuery from 'queries/walletBalances/useSNXBalanceQuery';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFeeClaimHistoryQuery from 'queries/staking/useFeeClaimHistoryQuery';
import useTotalIssuedSynthsExcludingEtherQuery from 'queries/synths/useTotalIssuedSynthsExcludingEtherQuery';

interface StatsProps {}

const Stats: React.FC<StatsProps> = ({}) => {
	const debtDataQuery = useGetDebtDataQuery();
	const snxBalanceQuery = useSNXBalanceQuery();

	const currentCRatio = debtDataQuery.data?.currentCRatio ?? 0;
	const targetCRatio = debtDataQuery.data?.targetCRatio ?? 0;
	const activeDebt = debtDataQuery.data?.debtBalance ?? 0;
	const stakedValue = snxBalanceQuery.data?.balance
		? snxBalanceQuery.data.balance * (currentCRatio / targetCRatio)
		: 0;

	const currencyRates = useCurrencyRatesQuery(['SNX']);
	const exchangeRates = useExchangeRatesQuery();

	const currentFeePeriod = useGetFeePoolDataQuery('0');
	const previousFeePeriod = useGetFeePoolDataQuery('1');

	const nextFeePeriodStarts = new Date(
		currentFeePeriod.data?.startTime
			? (currentFeePeriod.data.startTime + currentFeePeriod.data.feePeriodDuration) * 1000
			: 0
	);

	const currentFeePeriodStarts = new Date(
		currentFeePeriod.data?.startTime ? currentFeePeriod.data.startTime * 1000 : 0
	);

	const currentFeePeriodProgress = currentFeePeriod.data?.startTime
		? (Date.now() / 1000 - currentFeePeriod.data.startTime) /
		  currentFeePeriod.data.feePeriodDuration
		: 0;

	const history = useFeeClaimHistoryQuery();

	const checkClaimedStatus = useMemo(() => {
		let claimed = false;
		history.data?.feesClaimedHistory.map((tx) => {
			const claimedDate = new Date(tx.timestamp);
			if (claimedDate > currentFeePeriodStarts && claimedDate < nextFeePeriodStarts) {
				claimed = true;
			}
		});
		return claimed;
	}, [history]);

	const claimed = checkClaimedStatus;

	const sUSDRate = exchangeRates.data?.sUSD ?? 0;
	const SNXRate = currencyRates?.data?.SNX ?? 0;

	const weeklyRewards =
		sUSDRate * previousFeePeriod?.data?.feesToDistribute +
		SNXRate * previousFeePeriod?.data?.rewardsToDistribute;

	const totalIssuedSynthsExclEth = useTotalIssuedSynthsExcludingEtherQuery('sUSD');
	const stakingApy =
		(weeklyRewards * (activeDebt / totalIssuedSynthsExclEth?.data) * 52) / (stakedValue * SNXRate);

	return (
		<Content>
			<StatBoxes
				activeDebt={activeDebt}
				stakedValue={stakedValue * SNXRate}
				stakingApy={stakingApy}
			/>
			<BarStats
				currentCRatio={currentCRatio}
				targetCRatio={targetCRatio}
				claimed={claimed}
				nextFeePeriodStarts={nextFeePeriodStarts}
				currentFeePeriodProgress={currentFeePeriodProgress}
			/>
		</Content>
	);
};

const Content = styled(FlexDivCol)`
	width: 100%;
	max-width: 1200px;
`;

export default Stats;
