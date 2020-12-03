import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import Countdown from 'react-countdown';

import Table from 'components/Table';
import GoBackIcon from 'assets/svg/app/go-back.svg';
import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';

import { formatPercent, formatFiatCurrency, formatCurrency } from 'utils/formatters/number';

import { GridDivCenteredRow, FlexDivCentered, FlexDivCol, FlexDivColCentered } from 'styles/common';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';

export type EarnItem = {
	title: string;
	subtitle: string;
	apr: number;
	icon: () => JSX.Element;
	tvl: number;
	staked: {
		balance: number;
		asset: string; // use Cyrpto type
	};
	rewards: number;
	periodFinish: number;
	incentivesIndex: number;
};

interface IncentivesTableProps {
	data: EarnItem[];
	isLoaded: boolean;
	setActiveTab: (tab: number | null) => void;
	activeTab: number | null;
}

const IncentivesTable: FC<IncentivesTableProps> = ({ data, isLoaded, activeTab, setActiveTab }) => {
	const { t } = useTranslation();

	const leftColumns = [
		{
			Header: <Header>{t('earn.incentives.options.select-a-pool.title')}</Header>,
			accessor: 'title',
			Cell: (cellProps: CellProps<EarnItem>) => (
				<ClickableFlexDivCentered
					onClick={() => setActiveTab(cellProps.row.original.incentivesIndex)}
				>
					<div>{cellProps.row.original.icon()}</div>
					<FlexDivCol>
						<Title>{cellProps.row.original.title}</Title>
						<Subtitle>{cellProps.row.original.subtitle}</Subtitle>
					</FlexDivCol>
				</ClickableFlexDivCentered>
			),
			width: 175,
			sortable: false,
		},
		{
			Header: (
				<Header>
					{activeTab == null ? (
						<>{t('earn.incentives.est-apr')}</>
					) : (
						<GoBackDiv onClick={() => setActiveTab(null)}>
							<Svg src={GoBackIcon} />
						</GoBackDiv>
					)}
				</Header>
			),
			accessor: 'apr',
			Cell: (cellProps: CellProps<EarnItem>) => (
				<ClickableFlexDivCol onClick={() => setActiveTab(cellProps.row.original.incentivesIndex)}>
					<Title>{formatPercent(cellProps.row.original.apr)}</Title>
					<Subtitle>{t('earn.incentives.est-apr')}</Subtitle>
				</ClickableFlexDivCol>
			),
			width: 75,
			sortable: false,
		},
	];

	const rightColumns = [
		{
			Header: <Header>{t('earn.incentives.options.tvl.title')}</Header>,
			accessor: 'tvl',
			Cell: (cellProps: CellProps<EarnItem, EarnItem['tvl']>) => (
				<FlexDivColCentered>
					<Title>{formatFiatCurrency(cellProps.value ? cellProps.value : 0, { sign: '$' })}</Title>
					<Subtitle>{t('earn.incentives.options.tvl.subtitle')}</Subtitle>
				</FlexDivColCentered>
			),
			width: 150,
			sortable: true,
		},
		{
			Header: <Header>{t('earn.incentives.options.staked-balance.title')}</Header>,
			accessor: 'staked.balance',
			Cell: (cellProps: CellProps<EarnItem, EarnItem['staked']['balance']>) => (
				<FlexDivColCentered>
					<Title>
						{formatCurrency(CRYPTO_CURRENCY_MAP.SNX, cellProps.value, {
							currencyKey: CRYPTO_CURRENCY_MAP.SNX,
						})}
					</Title>
					<Subtitle>{t('earn.incentives.options.staked-balance.subtitle')}</Subtitle>
				</FlexDivColCentered>
			),
			width: 150,
			sortable: true,
		},
		{
			Header: <Header>{t('earn.incentives.options.rewards.title')}</Header>,
			accessor: 'rewards',
			Cell: (cellProps: CellProps<EarnItem, EarnItem['rewards']>) => (
				<FlexDivColCentered>
					<Title>
						{formatCurrency(CRYPTO_CURRENCY_MAP.SNX, cellProps.value, {
							currencyKey: CRYPTO_CURRENCY_MAP.SNX,
						})}
					</Title>
					<Subtitle>{t('earn.incentives.options.rewards.subtitle')}</Subtitle>
				</FlexDivColCentered>
			),
			width: 150,
			sortable: true,
		},
		{
			Header: <Header>{t('earn.incentives.options.time-left.title')}</Header>,
			accessor: 'periodFinish',
			Cell: (cellProps: CellProps<EarnItem, EarnItem['periodFinish']>) => (
				<FlexDivColCentered>
					<Subtitle>
						<Countdown date={cellProps.value} />
					</Subtitle>
				</FlexDivColCentered>
			),
			width: 150,
			sortable: true,
		},
	];

	return (
		<Container activeTab={activeTab}>
			<StyledTable
				palette="primary"
				columns={activeTab != null ? leftColumns : [...leftColumns, ...rightColumns]}
				data={data}
				columnsDeps={[activeTab]}
				isLoading={!isLoaded}
				noResultsMessage={
					isLoaded && data.length === 0 ? (
						<TableNoResults>
							<Svg src={NoNotificationIcon} />
							{t('escrow.table.no-results')}
						</TableNoResults>
					) : undefined
				}
				showPagination={true}
			/>
		</Container>
	);
};

const Container = styled.div<{ activeTab: number | null }>`
	background: ${(props) => props.theme.colors.mediumBlue};
	padding: 16px;
	width: ${(props) => (props.activeTab == null ? '100%' : '40%')};
`;

const StyledTable = styled(Table)`
	margin-top: 16px;
	.table-body-row {
		height: 60px;
		align-items: center;
	}
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.mediumBlue};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.expanded};
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
`;
const Subtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.gray10};
	font-size: 12px;
`;
const Header = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.gray10};
	width: 50%;
`;

const ClickableFlexDivCentered = styled(FlexDivCentered)`
	cursor: pointer;
`;

const ClickableFlexDivCol = styled(FlexDivCol)`
	cursor: pointer;
`;

const GoBackDiv = styled.div`
	cursor: pointer;
`;

export default IncentivesTable;
