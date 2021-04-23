import styled from 'styled-components';
import React, { FC, ReactNode, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Svg } from 'react-optimized-image';
import { Trans, useTranslation } from 'react-i18next';

import { FlexDiv, FlexDivCol, Row, Tooltip } from 'styles/common';
import { TabButton, TabList, TabPanelContainer } from '../../../../components/Tab';
import DebtHedgingInfoPanel from '../DebtHedgingInfoPanel';
import DebtPieChart from '../DebtPieChart';
import PortfolioTable from '../PortfolioTable';

import { DebtPanelType } from 'store/debt';
import useCryptoBalances from 'hooks/useCryptoBalances';
import useSynthsTotalSupplyQuery, {
	SynthsTotalSupplyData,
} from 'queries/synths/useSynthsTotalSupplyQuery';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';

import { zeroBN } from 'utils/formatters/number';

import Info from 'assets/svg/app/info.svg';

export type TabInfo = {
	title: string;
	icon?: ReactNode;
	tabChildren: ReactNode;
	key: string;
	disabled?: boolean;
	width?: number;
};

type DebtTabsProps = {
	tabData: TabInfo[];
	boxHeight?: number;
	boxWidth: number;
	boxPadding: number;
	tabHeight?: number;
	currentPanel?: string;
	setPanelType?: Dispatch<SetStateAction<any>>;
};

const DebtTabs: FC<DebtTabsProps> = ({
	tabData,
	boxHeight,
	boxWidth,
	boxPadding,
	tabHeight,
	currentPanel,
	setPanelType,
}) => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<string>(currentPanel ? currentPanel : tabData[0].key);
	useEffect(() => {
		if (currentPanel) {
			setActiveTab(currentPanel);
		}
	}, [currentPanel]);

	const synthsBalancesQuery = useSynthsBalancesQuery();
	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;
	const synthAssets = synthBalances?.balances ?? [];
	const cryptoBalances = useCryptoBalances();

	const totalSynthValue = synthsBalancesQuery.isSuccess
		? synthsBalancesQuery.data?.totalUSDBalance ?? zeroBN
		: zeroBN;

	const synthsTotalSupplyQuery = useSynthsTotalSupplyQuery();
	const totalSupply = synthsTotalSupplyQuery?.data ?? [];

	return (
		<>
			<Row>
				<DebtTabsContainer>
					<TabList padding={boxPadding} width={boxWidth}>
						{tabData.map(({ title, icon, key, disabled = false }, index) => (
							<TabButton
								isSingle={false}
								tabHeight={tabHeight}
								blue={true}
								numberTabs={tabData.length}
								key={`${key}-${index}-button`}
								name={title}
								active={activeTab === key}
								isDisabled={disabled}
								onClick={() => {
									setActiveTab(key);
									if (setPanelType != null) {
										setPanelType(key);
									}
								}}
							>
								{icon != null && icon}
								<TitleContainer>{title}</TitleContainer>
							</TabButton>
						))}
					</TabList>
					{tabData.map(
						({ title, tabChildren, key, width }, index) =>
							activeTab === key && (
								<TabPanelFullWidth
									id={`${title}-tabpanel`}
									role="tabpanel"
									aria-labelledby={`${title}-tab`}
									tabIndex={-1}
									padding={boxPadding}
									height={boxHeight}
									width={width || 0}
									key={`${key}-${index}-panel`}
								>
									{tabChildren}
								</TabPanelFullWidth>
							)
					)}
				</DebtTabsContainer>
				<DebtHedgingInfoPanel hidden={activeTab !== DebtPanelType.MANAGE} />
			</Row>
			{activeTab === DebtPanelType.OVERVIEW && (
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
							<PortfolioTable
								synthBalances={synthAssets}
								cryptoBalances={cryptoBalances.balances}
								synthsTotalSupply={totalSupply as SynthsTotalSupplyData}
								isLoading={synthsBalancesQuery.isLoading}
								isLoaded={synthsBalancesQuery.isSuccess}
								synthsTotalValue={totalSynthValue ?? zeroBN}
							/>
						</ContainerBody>
					</PortfolioContainer>
				</Row>
			)}
		</>
	);
};

const DebtTabsContainer = styled(FlexDivCol)`
	width: 100%;
`;

const TabPanelFullWidth = styled(TabPanelContainer)`
	width: ${(props) => (props.width ? `${props.width}px` : '100%')};
`;

const TitleContainer = styled.p`
	margin-left: 8px;
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.extended};
	text-transform: uppercase;
`;

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

const DebtPieChartContainer = styled(Container)`
	width: 360px;
`;

const PortfolioContainer = styled(Container)`
	width: 580px;
	align-self: flex-start;
`;

const ResizedInfoIcon = styled(Svg)`
	transform: scale(1.4);
`;

const Strong = styled.strong`
	font-family: ${(props) => props.theme.fonts.interBold};
`;

export default DebtTabs;
