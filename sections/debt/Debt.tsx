import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import { FlexDiv, FlexDivCol, Row, Tooltip } from 'styles/common';
import DebtChart from 'sections/debt/components/DebtChart';
import DebtPieChart from 'sections/debt/components/DebtPieChart';

import useSynthsTotalSupplyQuery, {
	SynthsTotalSupplyData,
} from 'queries/synths/useSynthsTotalSupplyQuery';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useHistoricalDebtData from 'hooks/useHistoricalDebtData';

import { zeroBN } from 'utils/formatters/number';

import Info from 'assets/svg/app/info.svg';

import PorfolioTable from './components/PortfolioTable';

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
	const totalSupply = synthsTotalSupplyQuery?.data ?? [];
	const dataIsLoading = historicalDebt?.isLoading ?? false;

	return (
		<FlexDivCol>
			<Container>
				<ContainerHeader>
					<ContainerHeaderSection>
						{t('debt.actions.track.title')}
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
					</ContainerHeaderSection>
				</ContainerHeader>
				<ContainerBody>
					<DebtChart data={historicalDebt.data} isLoading={dataIsLoading} />
				</ContainerBody>
			</Container>
			<Row>
				<DebtPieChartContainer>
					<ContainerHeader>
						{t('debt.actions.hedge.info.debt-pool-pie-chart.title')}
					</ContainerHeader>
					<ContainerBody style={{ padding: '24px 0' }}>
						<DebtPieChart data={totalSupply as SynthsTotalSupplyData} />
					</ContainerBody>
				</DebtPieChartContainer>
				<PortfolioContainer>
					<ContainerHeader>
						<ContainerHeaderSection>
							<span>{t('debt.actions.hedge.info.portfolio-table.title')}</span>
							<DebtInfoTooltip
								arrow={false}
								content={
									<Trans
										i18nKey="debt.actions.hedge.info.tooltip"
										components={[<Strong />]}
									></Trans>
								}
							>
								<TooltipIconContainer>
									<ResizedInfoIcon src={Info} />
								</TooltipIconContainer>
							</DebtInfoTooltip>
						</ContainerHeaderSection>
					</ContainerHeader>
					<ContainerBody style={{ padding: '24px 14px' }}>
						<PorfolioTable
							synths={synthAssets}
							synthsTotalSupply={totalSupply as SynthsTotalSupplyData}
							isLoading={synthsBalancesQuery.isLoading}
							isLoaded={synthsBalancesQuery.isSuccess}
							synthsTotalValue={totalSynthValue ?? zeroBN}
						/>
					</ContainerBody>
				</PortfolioContainer>
			</Row>
		</FlexDivCol>
	);
};

const Container = styled(FlexDivCol)`
	background: ${(props) => props.theme.colors.navy};
`;

const ContainerHeader = styled(FlexDiv)`
	width: 100%;
	padding: 14px 24px;
	border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
	font-family: ${(props) => props.theme.fonts.extended};
	text-transform: uppercase;
	font-size: 12px;
	align-items: center;
	justify-content: space-between;
`;

const ContainerHeaderSection = styled(FlexDiv)``;

const ContainerBody = styled.div`
	padding: 24px;
`;

const DebtPieChartContainer = styled(Container)`
	width: 360px;
`;

const PortfolioContainer = styled(Container)`
	width: 580px;
	align-self: flex-start;
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

const TooltipIconContainer = styled(FlexDiv)`
	margin-left: 10px;
	opacity: 0.6;
	align-items: center;
`;

const ResizedInfoIcon = styled(Svg)`
	transform: scale(1.4);
`;

const Strong = styled.strong`
	font-family: ${(props) => props.theme.fonts.interBold};
`;

export default DebtSection;
