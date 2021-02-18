import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';

import { Trans, useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { FlexDiv, FlexDivCol, LineSpacer, Row, StatsSection, Tooltip } from 'styles/common';

import StatBox from 'components/StatBox';
import useUserStakingData from 'hooks/useUserStakingData';

import { formatFiatCurrency, toBigNumber, zeroBN } from 'utils/formatters/number';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useSynthsTotalSupplyQuery from 'queries/synths/useSynthsTotalSupplyQuery';
import DebtChart from 'sections/debt/DebtChart';
import DebtPieChart from 'sections/debt/DebtPieChart';
import AssetsTable from 'sections/synths/AssetsTable';
import { last } from 'lodash';
import useHistoricalDebtData from 'hooks/useHistoricalDebtData';

import Info from 'assets/svg/app/info.svg';

const DashboardPage = () => {
	const { t } = useTranslation();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const { debtBalance: actualDebt } = useUserStakingData();
	const synthsBalancesQuery = useSynthsBalancesQuery();

	const historicalDebt = useHistoricalDebtData();

	const totalSynthValue = synthsBalancesQuery.isSuccess
		? synthsBalancesQuery.data?.totalUSDBalance ?? zeroBN
		: zeroBN;

	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;
	const synthAssets = synthBalances?.balances ?? [];

	const synthsTotalSupplyQuery = useSynthsTotalSupplyQuery();

	const totalSupply = synthsTotalSupplyQuery.isSuccess ? synthsTotalSupplyQuery.data : undefined;

	const dataIsLoading = historicalDebt?.isLoading ?? false;
	const issuedDebt = dataIsLoading
		? toBigNumber(0)
		: toBigNumber(last(historicalDebt.data)?.issuanceDebt ?? 0);

	const PortfolioHeader = (
		<PortfolioHeaderContainer>
			<span>{t('debt.actions.hedge.info.portfolio-table.title')}</span>
			<DebtInfoTooltip
				arrow={false}
				content={
					<Trans i18nKey="debt.actions.hedge.info.tooltip" components={[<Strong />]}></Trans>
				}
			>
				<TooltipIconContainer>
					<ResizedInfoIcon src={Info} />
				</TooltipIconContainer>
			</DebtInfoTooltip>
		</PortfolioHeaderContainer>
	);

	return (
		<>
			<Head>
				<title>{t('debt.page-title')}</title>
			</Head>
			<Content>
				<StatsSection>
					<IssuedDebt
						title={t('common.stat-box.issued-debt')}
						value={formatFiatCurrency(getPriceAtCurrentRate(issuedDebt), {
							sign: selectedPriceCurrency.sign,
						})}
					/>
					<ActiveDebt
						title={t('common.stat-box.active-debt')}
						value={formatFiatCurrency(getPriceAtCurrentRate(actualDebt), {
							sign: selectedPriceCurrency.sign,
						})}
						size="lg"
					/>
					<TotalSynthValue
						title={t('common.stat-box.synth-value')}
						value={formatFiatCurrency(getPriceAtCurrentRate(totalSynthValue), {
							sign: selectedPriceCurrency.sign,
						})}
					/>
				</StatsSection>
				<LineSpacer />
				<FlexDiv>
					<Header>{t('debt.actions.track.title')}</Header>
					<DebtInfoTooltip
						arrow={false}
						content={
							<Trans
								i18nKey="debt.actions.track.info.tooltip"
								components={[<Strong />, <br />, <Strong />]}
							></Trans>
						}
					>
						<TooltipIconContainer>
							<ResizedInfoIcon src={Info} />
						</TooltipIconContainer>
					</DebtInfoTooltip>
				</FlexDiv>
				<ChartSection>
					<DebtChart data={historicalDebt.data} isLoading={dataIsLoading} />
				</ChartSection>
				{totalSupply && (
					<Row>
						<DebtPieChartContainer>
							<DebtPieChart data={totalSupply} />
						</DebtPieChartContainer>
						<PortfolioContainer>
							<AssetsTable
								title={PortfolioHeader}
								assets={synthAssets}
								totalValue={totalSynthValue ?? zeroBN}
								isLoading={synthsBalancesQuery.isLoading}
								isLoaded={synthsBalancesQuery.isSuccess}
								showHoldings={true}
								showConvert={false}
								showDebtPoolProportion={true}
								synthsTotalSupply={totalSupply}
							/>
						</PortfolioContainer>
					</Row>
				)}
			</Content>
		</>
	);
};

const Content = styled(FlexDivCol)`
	width: 100%;
	max-width: 1200px;
`;

const IssuedDebt = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.blue};
	}
`;

const ActiveDebt = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.pink};
	}
	.value {
		text-shadow: ${(props) => props.theme.colors.pinkTextShadow};
		color: ${(props) => props.theme.colors.navy};
	}
`;

const TotalSynthValue = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.purple};
	}
`;

const Header = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 14px;
	padding-bottom: 20px;
`;

const ChartSection = styled.div`
	background: ${(props) => props.theme.colors.navy};
	padding: 32px;
`;

const DebtInfoTooltip = styled(Tooltip)`
	background: ${(props) => props.theme.colors.navy};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.navy};
	}
	.tippy-content {
		font-size: 14px;
	}
`;

const TooltipIconContainer = styled.div`
	margin-left: 10px;
	width: 23px;
	height: 23px;
	opacity: 0.6;
`;

const ResizedInfoIcon = styled(Svg)`
	transform: scale(2) translateX(2.5px);
`;

const Strong = styled.strong`
	font-family: ${(props) => props.theme.fonts.interBold};
`;

const DebtPieChartContainer = styled(FlexDivCol)`
	width: 360px;
	background: ${(props) => props.theme.colors.navy};
`;

const PortfolioContainer = styled(FlexDivCol)`
	width: 580px;
	align-self: flex-start;
	background: ${(props) => props.theme.colors.navy};
`;

const PortfolioHeaderContainer = styled(FlexDiv)`
	padding-left: 24px;
	padding-top: 24px;
`;

export default DashboardPage;
