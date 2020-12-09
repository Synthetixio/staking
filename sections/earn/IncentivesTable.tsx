import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled, { css } from 'styled-components';
import { Svg } from 'react-optimized-image';
import Countdown from 'react-countdown';
import ProgressBar from 'components/ProgressBar';

import Table from 'components/Table';
import GoBackIcon from 'assets/svg/app/go-back.svg';

import { formatPercent, formatFiatCurrency, formatCurrency } from 'utils/formatters/number';

import { GridDivCenteredRow, FlexDivCentered, FlexDivCol, FlexDivColCentered } from 'styles/common';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { NOT_APPLICABLE } from './Incentives';

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
	claimed: boolean | string;
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
					isActive={cellProps.row.original.incentivesIndex === activeTab}
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
				<ClickableFlexDivCol
					isActive={cellProps.row.original.incentivesIndex === activeTab}
					onClick={() => setActiveTab(cellProps.row.original.incentivesIndex)}
				>
					<Title>{formatPercent(cellProps.row.original.apr)}</Title>
					<Subtitle>{t('earn.incentives.est-apr')}</Subtitle>
				</ClickableFlexDivCol>
			),
			width: 100,
			sortable: false,
		},
	];

	const rightColumns = [
		{
			Header: <Header>{t('earn.incentives.options.tvl.title')}</Header>,
			accessor: 'tvl',
			Cell: (cellProps: CellProps<EarnItem, EarnItem['tvl']>) => (
				<ClickableFlexDivColCentered
					onClick={() => setActiveTab(cellProps.row.original.incentivesIndex)}
				>
					<Title>{formatFiatCurrency(cellProps.value ? cellProps.value : 0, { sign: '$' })}</Title>
					<Subtitle />
				</ClickableFlexDivColCentered>
			),
			width: 150,
			sortable: true,
		},
		{
			Header: <Header>{t('earn.incentives.options.staked-balance.title')}</Header>,
			accessor: 'staked.balance',
			Cell: (cellProps: CellProps<EarnItem, EarnItem['staked']['balance']>) => (
				<ClickableFlexDivColCentered
					onClick={() => setActiveTab(cellProps.row.original.incentivesIndex)}
				>
					<Title>
						{formatCurrency(
							cellProps.row.original.staked.asset,
							cellProps.row.original.staked.balance,
							{
								currencyKey: cellProps.row.original.staked.asset,
							}
						)}
					</Title>
					<Subtitle />
				</ClickableFlexDivColCentered>
			),
			width: 150,
			sortable: true,
		},
		{
			Header: <Header>{t('earn.incentives.options.rewards.title')}</Header>,
			accessor: 'rewards',
			Cell: (cellProps: CellProps<EarnItem, EarnItem['rewards']>) => (
				<ClickableFlexDivColCentered
					onClick={() => setActiveTab(cellProps.row.original.incentivesIndex)}
				>
					<Title>
						{formatCurrency(CRYPTO_CURRENCY_MAP.SNX, cellProps.value, {
							currencyKey: CRYPTO_CURRENCY_MAP.SNX,
						})}
					</Title>
					<Subtitle>
						{cellProps.row.original.claimed !== NOT_APPLICABLE && cellProps.row.original.claimed
							? t('earn.incentives.options.rewards.claimed')
							: t('earn.incentives.options.rewards.claimable')}
					</Subtitle>
				</ClickableFlexDivColCentered>
			),
			width: 150,
			sortable: true,
		},
		{
			Header: <Header>{t('earn.incentives.options.time-left.title')}</Header>,
			accessor: 'periodFinish',
			Cell: (cellProps: CellProps<EarnItem, EarnItem['periodFinish']>) => (
				<ClickableFlexDivColCentered
					onClick={() => setActiveTab(cellProps.row.original.incentivesIndex)}
				>
					<StyledProgressBar percentage={0.5} borderColor="transparent" fillColor="transparent" />
					<Subtitle>
						<Countdown date={cellProps.value} />
					</Subtitle>
				</ClickableFlexDivColCentered>
			),
			width: 100,
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
				noResultsMessage={undefined}
				showPagination={true}
			/>
		</Container>
	);
};

const Container = styled.div<{ activeTab: number | null }>`
	background: ${(props) => props.theme.colors.navy};
	width: ${(props) => (props.activeTab == null ? '100%' : '40%')};
`;

const StyledProgressBar = styled(ProgressBar)`
	width: 80%;
	margin: 0 auto 4px auto;

	.filled-bar {
		background: ${(props) => props.theme.colors.rainbowGradient};
		box-shadow: none;
		border: 0;
	}
	.unfilled-bar {
		background: ${(props) => props.theme.colors.white};
		box-shadow: none;
		border: 0;
		opacity: 0.2;
	}
`;

const StyledTable = styled(Table)`
	margin-top: 16px;
	.table-body-row {
		height: 80px;
		align-items: center;
		:hover {
			background-color: ${(props) => props.theme.colors.mediumBlue};
		}
	}
	.table-body-cell {
		:first-child {
			padding-left: 0px;
		}
		:last-child {
			padding-right: 0px;
		}
	}
`;

const StyledTableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.navy};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.interBold};
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
`;
const Subtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	color: ${(props) => props.theme.colors.gray};
	font-size: 12px;
`;
const Header = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.gray};
	text-align: center;
`;

const ClickableFlexDivCentered = styled(FlexDivCentered)<{ isActive: boolean }>`
	cursor: pointer;
	height: 80px;
	width: 100%;
	padding-left: 18px;
	${(props) =>
		props.isActive &&
		css`
			background-color: ${props.theme.colors.mediumBlue};
		`}
`;

const ClickableFlexDivColCentered = styled(FlexDivColCentered)`
	cursor: pointer;
	height: 80px;
	width: 100%;
	justify-content: center;
`;

const ClickableFlexDivCol = styled(FlexDivCol)<{ isActive: boolean }>`
	cursor: pointer;
	height: 80px;
	width: 100%;
	justify-content: center;
	${(props) =>
		props.isActive &&
		css`
			border-right: 1px solid ${props.theme.colors.blue};
			background-color: ${props.theme.colors.mediumBlue};
		`}
`;

const GoBackDiv = styled.div`
	cursor: pointer;
`;

export default IncentivesTable;
