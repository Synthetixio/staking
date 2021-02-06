import React, { useState, useEffect } from 'react';

import orderBy from 'lodash/orderBy';
import last from 'lodash/last';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { SynthetixJs, snxData } from 'utils/snxjs';

import { zeroBN } from 'utils/formatters/number';

import Main from 'sections/track';

import { walletAddressState } from 'store/wallet';

import StatBox from 'components/StatBox';
import ProgressBar from 'components/ProgressBar';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';

export type HistoricalDebtAndIssuance = {
	timestamp: number;
	actualDebt: number;
	issuanceDebt: number | undefined;
};

type DebtModel = {
	mintAndBurnDebt: number;
	actualDebt: number;
};
type DebtHistory = {
	account: string;
	block: number;
	debtBalanceOf: number;
	timestamp: number;
};
type Event = {
	account: string;
	block: number;
	timestamp: number;
};

const TrackPage = () => {
	const { t } = useTranslation();
	const snxjs = new SynthetixJs();
	const [debtData, setDebtData] = useState<DebtModel | null>();
	const [historicalDebt, setHistoricalDebt] = useState<HistoricalDebtAndIssuance[]>([]);
	const exchangeRatesQuery = useExchangeRatesQuery();

	const synthsBalancesQuery = useSynthsBalancesQuery();

	const totalSynthValue = synthsBalancesQuery.isSuccess
		? synthsBalancesQuery.data?.totalUSDBalance ?? zeroBN
		: zeroBN;

	const totalSynths = totalSynthValue.toNumber();

	const walletAddress = useRecoilValue(walletAddressState);

	const bytesFormatter = (input: String) => snxjs.ethers.utils.formatBytes32String(input);

	const sUSDRate = exchangeRatesQuery.data?.sUSD ?? 0;

	useEffect(() => {
		if (!walletAddress) return;
		const fetchEvents = async () => {
			try {
				const [burnEvents, mintEvents, debtHistory, currentDebt]: [
					Event[],
					Event[],
					DebtHistory[],
					number
				] = await Promise.all([
					snxData.snx.burned({ account: walletAddress, max: 1000 }),
					snxData.snx.issued({ account: walletAddress, max: 1000 }),
					snxData.snx.debtSnapshot({
						account: walletAddress,
						max: 1000,
					}),
					snxjs.Synthetix.debtBalanceOf(walletAddress, bytesFormatter('sUSD')),
				]);

				const burnEventsMap = burnEvents.map((event: any) => {
					return { ...event, type: 'burn' };
				});

				const mintEventsMap = mintEvents.map((event: any) => {
					return { ...event, type: 'mint' };
				});

				// We concat both the events and order them (asc)
				const eventBlocks = orderBy(burnEventsMap.concat(mintEventsMap), 'block', 'asc');

				// We set historicalIssuanceAggregation array, to store all the cumulative
				// values of every mint and burns
				const historicalIssuanceAggregation: number[] = [];
				eventBlocks.forEach((event, i) => {
					const multiplier = event.type === 'burn' ? -1 : 1;
					const aggregation =
						historicalIssuanceAggregation.length === 0
							? multiplier * event.value
							: multiplier * event.value + historicalIssuanceAggregation[i - 1];

					historicalIssuanceAggregation.push(aggregation);
				});

				// We merge both actual & issuance debt into an array
				let historicalDebtAndIssuance: HistoricalDebtAndIssuance[] = [];
				debtHistory.reverse().forEach((debtSnapshot, i) => {
					historicalDebtAndIssuance.push({
						timestamp: debtSnapshot.timestamp,
						issuanceDebt: historicalIssuanceAggregation[i],
						actualDebt: debtSnapshot.debtBalanceOf,
					});
				});

				// Last occurrence is the current state of the debt
				// Issuance debt = last occurrence of the historicalDebtAndIssuance array
				historicalDebtAndIssuance.push({
					timestamp: new Date().getTime(),
					actualDebt: currentDebt / 1e18,
					issuanceDebt: last(historicalIssuanceAggregation),
					// netDebt: currentDebt / 1e18 - last(historicalIssuanceAggregation),
				});

				setHistoricalDebt(historicalDebtAndIssuance);
				setDebtData({
					mintAndBurnDebt: last(historicalIssuanceAggregation) ?? 0,
					actualDebt: currentDebt / 1e18,
					// netDebt: currentDebt / 1e18 - last(historicalIssuanceAggregation),
				});
			} catch (error) {
				console.error({ error });
			}
		};
		fetchEvents();
	}, [walletAddress]);

	const mintAndBurnDebtValue = debtData ? (debtData?.mintAndBurnDebt || 0) * sUSDRate : 0;
	const actualDebtValue = debtData ? (debtData?.actualDebt || 0) * sUSDRate : 0;

	const totalSynthsValue = totalSynths ? totalSynths * sUSDRate : 0;

	return (
		<>
			<Head>
				<title>{t('track.page-title')}</title>
			</Head>

			<Main
				data={historicalDebt}
				mintAndBurnDebtValue={mintAndBurnDebtValue}
				actualDebtValue={actualDebtValue}
				totalSynthsValue={totalSynthsValue}
			/>
		</>
	);
};

export default TrackPage;
