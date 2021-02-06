import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';

import { useRecoilValue } from 'recoil';
import orderBy from 'lodash/orderBy';
import last from 'lodash/last';

import { 
    ExternalLink, 
    Tooltip, 
    FlexDivColCentered,
    StatsSection,
    LineSpacer
} from 'styles/common';

import StatBox from 'components/StatBox';
import Info from 'components/Info';

import BalanceTable from 'sections/debt/BalanceTable';
import DebtChart from 'sections/debt/DebtChart';
import { Subtitle, Header, Container } from 'sections/debt/components/common';

import { walletAddressState } from 'store/wallet';

import useSynthIssuedQuery from 'queries/staking/useSynthIssuedQuery';
import useSynthBurnedQuery from 'queries/staking/useSynthBurnedQuery';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useGetDebtSnapshotQuery, { DebtSnapshotData } from 'queries/debt/useGetDebtSnapshotQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { HistoricalStakingTransaction } from 'queries/staking/types';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import { CryptoBalance } from 'queries/walletBalances/types';


import { toBigNumber, zeroBN, formatCurrencyWithSign } from 'utils/formatters/number';

type HistoricalDebtAndIssuance =  {
    timestamp: number;
    actualDebt: number;
    issuanceDebt: number;
}

type DebtModel = {
    mintAndBurnDebt: number;
    actualDebt: number;
}

const DebtPage = () => {
	const { t } = useTranslation();
	const [debtModel, setDebtModel] = useState<DebtModel | null>();
    const [historicalDebt, setHistoricalDebt] = useState<HistoricalDebtAndIssuance[]>([]);
    const [sUSDRate, setsUSDRate] = useState<number>();
    const [totalSynths, setTotalSynths] = useState<number>();
    const [mintAndBurnDebtValue, setMintAndBurnDebtValue] = useState<number>();
    const [totalSynthsValue, setTotalSynthsValue] = useState<number>();
    const [actualDebtValue, setActualDebtValue] = useState<number>();
    const [synthAssets, setSynthAssets] = useState<CryptoBalance[]>();
    const walletAddress = useRecoilValue(walletAddressState);
    const [fetchedSynths, setFetchedSynths] = useState<boolean>(false);

    const issuedQuery = useSynthIssuedQuery(1000);
    const burnedQuery = useSynthBurnedQuery(1000);
    const debtSnapshotQuery = useGetDebtSnapshotQuery();
    const debtDataQuery = useGetDebtDataQuery();
    const exchangeRatesQuery = useExchangeRatesQuery();
    const synthsBalancesQuery = useSynthsBalancesQuery();
    const loaded = issuedQuery.isSuccess && burnedQuery.isSuccess 
            && debtDataQuery.isSuccess && debtSnapshotQuery.isSuccess 
            && synthsBalancesQuery.isSuccess;
    
    useEffect(() => {
        if (loaded) {
            const issued: HistoricalStakingTransaction[] = issuedQuery.data ?? [];
            const burned: HistoricalStakingTransaction[] = burnedQuery.data ?? [];
            const debtSnapshots: DebtSnapshotData[] = debtSnapshotQuery.data ?? [];

            const sUSDRate = exchangeRatesQuery.data?.sUSD ?? 0;
            const debtData = debtDataQuery.data ?? null;

            const localTotalSynths = synthsBalancesQuery.isSuccess
            ? synthsBalancesQuery.data?.totalUSDBalance ?? zeroBN
            : zeroBN;

            const synthBalances =
                synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
                    ? synthsBalancesQuery.data
                    : null;

            const synthAssets = synthBalances?.balances ?? [];

            // We concat both the events and order them (asc)
            const burnEventsMap = burned.map(event => {
                return { ...event, type: 'burn' };
            });

            const mintEventsMap = issued.map(event => {
                return { ...event, type: 'mint' };
            });

            const eventBlocks = orderBy(burnEventsMap.concat(mintEventsMap), 'block', 'asc');
            const historicalIssuanceAggregation: number[] = [];
            // We set historicalIssuanceAggregation array, to store all the cumulative
            // values of every mint and burns
            eventBlocks.forEach((event, i) => {
                const multiplier = event.type === 'burn' ? -1 : 1;
                const aggregation =
                    historicalIssuanceAggregation.length === 0
                        ? multiplier * event.value
                        : multiplier * event.value + historicalIssuanceAggregation[i - 1];

                historicalIssuanceAggregation.push(aggregation);
            });

            let historicalDebtAndIssuance: HistoricalDebtAndIssuance[] = [];
            // We merge both actual & issuance debt into an array
            debtSnapshots.reverse().forEach((debtSnapshot, i) => {
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
                actualDebt: toBigNumber(debtData?.debtBalance ?? 0).toNumber(),
                issuanceDebt: last(historicalIssuanceAggregation) ?? 0,
            });
            setHistoricalDebt(historicalDebtAndIssuance);
            setDebtModel({
                mintAndBurnDebt: last(historicalIssuanceAggregation) ?? 0,
                actualDebt: toBigNumber(debtData?.debtBalance ?? 0).toNumber(),
            });
            setsUSDRate(sUSDRate);
            setTotalSynths(localTotalSynths.toNumber());
            setSynthAssets(synthAssets);
            setFetchedSynths(true)
        }
    }, [walletAddress, 
        loaded]);
    
    useEffect(() => {
        if (sUSDRate && debtModel?.actualDebt && debtModel.mintAndBurnDebt) {
            const mintAndBurnDebtValue = debtModel.mintAndBurnDebt * sUSDRate;
            const actualDebtValue = debtModel.actualDebt * sUSDRate;
            const totalSynthsValue = totalSynths ? totalSynths * sUSDRate : 0;
            setMintAndBurnDebtValue(mintAndBurnDebtValue)
            setActualDebtValue(actualDebtValue)
            setTotalSynthsValue(totalSynthsValue)

        }}, [sUSDRate, debtModel, totalSynths, fetchedSynths]
    )

	return (
		<>
            <Head>
            <title>{t('debt.page-title')}</title>
            </Head>
            <StatsSection>
                <StyledStatsBox
                        title={t('debt.track.data.issuedDebt')}
                        value={formatCurrencyWithSign('$', mintAndBurnDebtValue ?? 0)}
                    />
                <StyledStatsBox
                        title={t('debt.track.data.actualDebt')}
                        value={formatCurrencyWithSign('$', actualDebtValue ?? 0)}
                />
                <StyledStatsBox
                        title={t('debt.track.data.totalSynths')}
                        value={formatCurrencyWithSign('$', totalSynthsValue ?? 0)}
                />
            </StatsSection>
            <LineSpacer />
            <Subtitle>
                    {t('debt.track.subtitle')}
                    <ExternalLink href="https://www.zapper.fi/">
                        {' '}
                        Zapper.fi <LinkArrow>↗</LinkArrow>
                    </ExternalLink>
            </Subtitle>
            <Header>{t('debt.track.chart.title')}</Header>
            <ChartBorderedContainer>
                <StyledTooltip
                    content={
                        <Trans 
                            i18nKey="debt.track.tooltip.info" 
                            components={[<Strong />, <br />, <Strong />]}
                        ></Trans>
                    }
                    ignoreAttributes={false}
                >
                    <TooltipIconContainer>
                        <Info />
                    </TooltipIconContainer>
                </StyledTooltip>
                <DebtChart data={historicalDebt} isLoaded={loaded}/>
            </ChartBorderedContainer>
            <BalanceTable 
                assets={synthAssets ?? []}
                title={t('debt.track.table.title')}
                isLoaded={true}
            />
        </>
	);
};

const StyledStatsBox = styled(StatBox)`
	.value {
		text-shadow: ${(props) => props.theme.colors.blueTextShadow};
		color: ${(props) => props.theme.colors.black};
	}
`;

const Strong = styled.strong`
    font-family: ${(props) => props.theme.fonts.extended};
`;

const ChartBorderedContainer = styled(Container)`
	justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    background-color: ${(props) => props.theme.colors.navy};
    margin-bottom: 1vh;
`;

const TooltipIconContainer = styled.div`
	margin-left: 96%;
	width: 23px;
	height: 23px;
`;

const StyledTooltip = styled(Tooltip)`
    background: ${(props) => props.theme.colors.mediumBlue};
    font-family: ${(props) => props.theme.fonts.regular};
    text-align: 'right';

`;

const LinkArrow = styled.span`
	font-size: 10px;
`;

export default DebtPage