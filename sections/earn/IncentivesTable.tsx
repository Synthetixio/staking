import React, { FC, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps, Row } from 'react-table';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import Countdown from 'react-countdown';
import { useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';

import ProgressBar from 'components/ProgressBar';
import Table from 'components/Table';
import Button from 'components/Button';

import GoBackIcon from 'assets/svg/app/go-back.svg';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import {
	formatPercent,
	formatFiatCurrency,
	formatCurrency,
	toBigNumber,
} from 'utils/formatters/number';

import { isWalletConnectedState } from 'store/wallet';

import {
	FlexDivCol,
	IconButton,
	TableNoResults,
	TableNoResultsButtonContainer,
	TableNoResultsTitle,
} from 'styles/common';
import { CryptoCurrency } from 'constants/currency';
import { NOT_APPLICABLE } from './Incentives';
import { Tab } from './types';
import { useRouter } from 'next/router';
import ROUTES from 'constants/routes';

export type EarnItem = {
	title: string;
	subtitle: string;
	apy: number;
	icon: ReactNode;
	tvl: number;
	staked: {
		balance: number;
		asset: string; // use Cyrpto type
	};
	rewards: number;
	periodStarted: number;
	periodFinish: number;
	claimed: boolean | string;
	now: number;
	tab: Tab;
	route: string;
};

type IncentivesTableProps = {
	data: EarnItem[];
	isLoaded: boolean;
	activeTab: Tab | null;
};

const IncentivesTable: FC<IncentivesTableProps> = ({ data, isLoaded, activeTab }) => {
	const { t } = useTranslation();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const router = useRouter();
	const { connectWallet } = Connector.useContainer();

	const columns = useMemo(() => {
		const leftColumns = [
			{
				Header: <>{t('earn.incentives.options.select-a-pool.title')}</>,
				accessor: 'title',
				Cell: (cellProps: CellProps<EarnItem>) => (
					<>
						<div>{cellProps.row.original.icon}</div>
						<FlexDivCol>
							<Title>{cellProps.row.original.title}</Title>
							<Subtitle>{cellProps.row.original.subtitle}</Subtitle>
						</FlexDivCol>
					</>
				),
				width: 175,
				sortable: false,
			},
			{
				Header: (
					<CellContainer>
						{activeTab == null ? (
							<>{t('earn.incentives.est-apy')}</>
						) : (
							<StyledIconButton onClick={() => router.push(ROUTES.Earn.Home)}>
								<Svg src={GoBackIcon} />
							</StyledIconButton>
						)}
					</CellContainer>
				),
				accessor: 'apy',
				Cell: (cellProps: CellProps<EarnItem>) => (
					<CellContainer>
						<Title isNumeric={true}>{formatPercent(cellProps.row.original.apy)}</Title>
						<Subtitle>{t('earn.incentives.est-apy')}</Subtitle>
					</CellContainer>
				),
				width: 100,
				maxWidth: 100,
				sortable: false,
			},
		];

		const rightColumns = [
			{
				Header: <>{t('earn.incentives.options.staked-balance.title')}</>,
				accessor: 'staked.balance',
				Cell: (cellProps: CellProps<EarnItem, EarnItem['staked']['balance']>) => (
					<CellContainer>
						<Title isNumeric={true}>
							{formatCurrency(
								cellProps.row.original.staked.asset,
								cellProps.row.original.staked.balance,
								{
									currencyKey: cellProps.row.original.staked.asset,
								}
							)}
						</Title>
						<Subtitle />
					</CellContainer>
				),
				width: 150,
				sortable: true,
			},
			{
				Header: <>{t('earn.incentives.options.tvl.title')}</>,
				accessor: 'tvl',
				Cell: (cellProps: CellProps<EarnItem, EarnItem['tvl']>) => (
					<CellContainer>
						<Title isNumeric={true}>
							{formatFiatCurrency(
								getPriceAtCurrentRate(toBigNumber(cellProps.value != null ? cellProps.value : 0)),
								{
									sign: selectedPriceCurrency.sign,
								}
							)}
						</Title>
					</CellContainer>
				),
				width: 150,
				sortable: true,
			},

			{
				Header: <>{t('earn.incentives.options.rewards.title')}</>,
				accessor: 'rewards',
				Cell: (cellProps: CellProps<EarnItem, EarnItem['rewards']>) => (
					<CellContainer>
						<Title isNumeric={true}>
							{formatCurrency(CryptoCurrency.SNX, cellProps.value, {
								currencyKey: CryptoCurrency.SNX,
							})}
						</Title>
						<Subtitle>
							{cellProps.row.original.claimed === NOT_APPLICABLE ? (
								''
							) : cellProps.row.original.claimed ? (
								t('earn.incentives.options.rewards.claimed')
							) : (
								<Claimable>{t('earn.incentives.options.rewards.claimable')}</Claimable>
							)}
						</Subtitle>
					</CellContainer>
				),
				width: 150,
				sortable: true,
			},
			{
				Header: <>{t('earn.incentives.options.time-left.title')}</>,
				accessor: 'periodFinish',
				Cell: (cellProps: CellProps<EarnItem, EarnItem['periodFinish']>) => (
					<CellContainer style={{ width: '100%' }}>
						<StyledProgressBar
							percentage={
								(cellProps.row.original.now - cellProps.row.original.periodStarted) /
								(cellProps.row.original.periodFinish - cellProps.row.original.periodStarted)
							}
							variant="rainbow"
						/>
						<Subtitle>
							<Countdown date={cellProps.value} />
						</Subtitle>
					</CellContainer>
				),
				width: 100,
				sortable: true,
			},
		];
		return activeTab != null ? leftColumns : [...leftColumns, ...rightColumns];
	}, [activeTab, getPriceAtCurrentRate, selectedPriceCurrency.sign, t, router]);

	return (
		<Container activeTab={activeTab}>
			<StyledTable
				palette="primary"
				columns={columns}
				data={data}
				columnsDeps={[activeTab, selectedPriceCurrency]}
				isLoading={isWalletConnected && !isLoaded}
				showPagination={true}
				onTableRowClick={(row: Row<EarnItem>) => router.push(row.original.route)}
				isActiveRow={(row: Row<EarnItem>) => row.original.tab === activeTab}
				noResultsMessage={
					!isWalletConnected ? (
						<TableNoResults>
							<TableNoResultsTitle>{t('common.wallet.no-wallet-connected')}</TableNoResultsTitle>
							<TableNoResultsButtonContainer>
								<Button variant="primary" onClick={connectWallet}>
									{t('common.wallet.connect-wallet')}
								</Button>
							</TableNoResultsButtonContainer>
						</TableNoResults>
					) : undefined
				}
			/>
		</Container>
	);
};

const Container = styled.div<{ activeTab: Tab | null }>`
	background: ${(props) => props.theme.colors.navy};
	width: ${(props) => (props.activeTab == null ? '100%' : '40%')};
`;

const StyledProgressBar = styled(ProgressBar)`
	margin-bottom: 5px;
`;

const CellContainer = styled(FlexDivCol)`
	width: 100%;
`;

const StyledTable = styled(Table)`
	.table-body-row {
		height: 70px;
		align-items: center;
		&:hover {
			background-color: ${(props) => props.theme.colors.mediumBlue};
		}
		&.active-row {
			border-right: 1px solid ${(props) => props.theme.colors.blue};
		}
	}
	.table-body-cell {
		&:first-child {
			padding-left: 2px;
		}
		&:last-child {
			padding-left: 0;
		}
	}
`;

const Title = styled.div<{ isNumeric?: boolean }>`
	font-family: ${(props) =>
		props.isNumeric ? props.theme.fonts.mono : props.theme.fonts.interBold};
	color: ${(props) => props.theme.colors.white};
`;

const Subtitle = styled.div`
	color: ${(props) => props.theme.colors.gray};
	padding-top: 1px;
`;

const StyledIconButton = styled(IconButton)`
	margin-left: auto;
	svg {
		color: ${(props) => props.theme.colors.gray};
	}
	&:hover {
		svg {
			color: ${(props) => props.theme.colors.white};
		}
	}
`;

const Claimable = styled.span`
	color: ${(props) => props.theme.colors.green};
`;
export default IncentivesTable;
