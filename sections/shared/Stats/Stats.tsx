import React from 'react';
import styled from 'styled-components';
import { FlexDivCol } from 'styles/common';
import TripleStatBox from './TripleStatBox';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useTotalIssuedSynthsExcludingEtherQuery from 'queries/synths/useTotalIssuedSynthsExcludingEtherQuery';
import { useRouter } from 'next/router';
import ROUTES from 'constants/routes';
import SingleStatBox from './SingleStatBox';

const Stats: React.FC = () => {
	const router = useRouter();

	const debtDataQuery = useGetDebtDataQuery();
	const totalIssuedSynthsExclEth = useTotalIssuedSynthsExcludingEtherQuery('sUSD');
	const currencyRates = useCurrencyRatesQuery(['SNX']);
	const exchangeRates = useExchangeRatesQuery();
	const previousFeePeriod = useGetFeePoolDataQuery('1');

	const currentCRatio = debtDataQuery.data?.currentCRatio ?? 0;
	const targetCRatio = debtDataQuery.data?.targetCRatio ?? 0;
	const activeDebt = debtDataQuery.data?.debtBalance ?? 0;
	const collateral = debtDataQuery.data?.collateral ?? 0;
	const stakedValue = collateral * Math.min(1, currentCRatio / targetCRatio);
	const sUSDRate = exchangeRates.data?.sUSD ?? 0;
	const SNXRate = currencyRates.data?.SNX ?? 0;
	const feesToDistribute = previousFeePeriod?.data?.feesToDistribute ?? 0;
	const rewardsToDistribute = previousFeePeriod?.data?.rewardsToDistribute ?? 0;
	const totalsUSDDebt = totalIssuedSynthsExclEth?.data ?? 0;
	const weeklyRewards = sUSDRate * feesToDistribute + SNXRate * rewardsToDistribute;
	const stakingApy = (weeklyRewards * (activeDebt / totalsUSDDebt) * 52) / (stakedValue * SNXRate);

	const returnStats = () => {
		switch (router.pathname) {
			case ROUTES.Home:
				return (
					<TripleStatBox
						activeDebt={activeDebt}
						stakedValue={stakedValue * SNXRate}
						stakingApy={stakingApy}
					/>
				);
			case ROUTES.Staking.Home:
				return (
					<TripleStatBox
						activeDebt={activeDebt}
						stakedValue={stakedValue * SNXRate}
						cRatio={currentCRatio}
					/>
				);
			case ROUTES.Earn.Home:
				return (
					<TripleStatBox
						activeDebt={activeDebt}
						stakedValue={stakedValue * SNXRate}
						stakingApy={stakingApy}
					/>
				);
			case ROUTES.Escrow.Home:
				return null;
			case ROUTES.History.Home:
				return <SingleStatBox transactionCount={123} />;
			case ROUTES.Synths.Home:
				return <SingleStatBox synthValue={234124} />;
			default:
				return null;
		}
	};

	return <Content>{returnStats()}</Content>;
};

const Content = styled(FlexDivCol)`
	width: 100%;
	max-width: 1200px;
`;

export default Stats;
