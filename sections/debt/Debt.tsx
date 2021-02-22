import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import { FlexDiv, FlexDivCol, LineSpacer, Row, StatsSection, Tooltip } from 'styles/common';
import DebtChart from 'sections/debt/components/DebtChart';
import DebtPieChart from 'sections/debt/components/DebtPieChart';
import AssetsTable from 'sections/synths/AssetsTable';

import useSynthsTotalSupplyQuery from 'queries/synths/useSynthsTotalSupplyQuery';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useHistoricalDebtData from 'hooks/useHistoricalDebtData';

import { zeroBN } from 'utils/formatters/number';

import Info from 'assets/svg/app/info.svg';

const DebtSection = () => {
	const { t } = useTranslation();
	const synthsBalancesQuery = useSynthsBalancesQuery();
	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;
	const synthAssets = synthBalances?.balances ?? [];
	const historicalDebt = useHistoricalDebtData();
	const totalSynthValue = synthsBalancesQuery.isSuccess
		? synthsBalancesQuery.data?.totalUSDBalance ?? zeroBN
		: zeroBN;

	const synthsTotalSupplyQuery = useSynthsTotalSupplyQuery();
	const totalSupply = synthsTotalSupplyQuery.isSuccess ? synthsTotalSupplyQuery.data : undefined;
	const dataIsLoading = historicalDebt?.isLoading ?? false;

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
		<FlexDivCol>
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
		</FlexDivCol>
	);
};

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

const DebtPieChartContainer = styled(FlexDivCol)`
	width: 360px;
	background: ${(props) => props.theme.colors.navy};
`;

const PortfolioContainer = styled(FlexDivCol)`
	width: 580px;
	align-self: flex-start;
	background: ${(props) => props.theme.colors.navy};
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

const PortfolioHeaderContainer = styled(FlexDiv)`
	padding-left: 24px;
	padding-top: 24px;
`;

export default DebtSection;
