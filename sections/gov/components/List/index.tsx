import React, { useMemo } from 'react';
import styled from 'styled-components';
import { CellProps, Row } from 'react-table';
import { isWalletConnectedState } from 'store/wallet';
import { FlexDivCol } from 'styles/common';
import media from 'styles/media';
import Button from 'components/Button';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Proposal as ProposalType } from 'queries/gov/types';
import Table from 'components/Table';
import { useTranslation } from 'react-i18next';
import Countdown from 'react-countdown';
import { useRouter } from 'next/router';
import ROUTES from 'constants/routes';
import { panelState, PanelType, proposalState } from 'store/gov';
import useActiveTab from '../../hooks/useActiveTab';
import { DURATION_SEPARATOR } from 'constants/date';
import { getCurrentTimestampSeconds } from 'utils/formatters/date';
import { DesktopOrTabletView, MobileOnlyView } from 'components/Media';

type IndexProps = {
	data: ProposalType[];
	isLoaded: boolean;
};

const Index: React.FC<IndexProps> = ({ data, isLoaded }) => {
	return (
		<>
			<DesktopOrTabletView>
				<ResponsiveTable {...{ data, isLoaded }} />
			</DesktopOrTabletView>
			<MobileOnlyView>
				<ResponsiveTable {...{ data, isLoaded }} mobile />
			</MobileOnlyView>
		</>
	);
};

type ResponsiveTableProps = {
	data: ProposalType[];
	isLoaded: boolean;
	mobile?: boolean;
};

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ data, isLoaded, mobile }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const setProposal = useSetRecoilState(proposalState);
	const setPanelType = useSetRecoilState(panelState);
	const activeTab = useActiveTab();

	const columns = useMemo(() => {
		const widths = mobile ? ['auto', 70, 70, 50] : [200, 75, 100, 75];
		return [
			{
				Header: <>{t('gov.table.description')}</>,
				accessor: 'description',
				Cell: (cellProps: CellProps<ProposalType>) => (
					<CellContainer>
						<Title>{cellProps.row.original.msg.payload.name}</Title>
					</CellContainer>
				),
				sortable: false,
			},
			{
				Header: <>{t('gov.table.status.title')}</>,
				accessor: 'status',
				Cell: (cellProps: CellProps<ProposalType>) => {
					const currentTimestampSeconds = getCurrentTimestampSeconds();
					const closed =
						cellProps.row.original.msg.payload.end < currentTimestampSeconds ? true : false;
					const pending =
						currentTimestampSeconds < cellProps.row.original.msg.payload.start ? true : false;
					return (
						<CellContainer>
							<Status closed={closed} pending={pending}>
								{closed
									? `${t('gov.table.status.closed')}`
									: pending
									? `${t('gov.table.status.pending')}`
									: `${t('gov.table.status.open')}`}
							</Status>
						</CellContainer>
					);
				},
				sortable: false,
			},
			{
				Header: <>{t('gov.table.time')}</>,
				accessor: 'timeLeft',
				Cell: (cellProps: CellProps<ProposalType>) => (
					<CellContainer>
						<Title isNumeric={true}>
							<Countdown
								autoStart={true}
								date={cellProps.row.original.msg.payload.end * 1000}
								renderer={({ days, hours, minutes }) => {
									if (mobile) {
										const duration = [days, hours, minutes];
										return <span>{duration.join(':')}</span>;
									}

									const duration = [
										`${days}${t('common.time.days')}`,
										`${hours}${t('common.time.hours')}`,
										`${minutes}${t('common.time.minutes')}`,
									];

									return <span>{duration.join(DURATION_SEPARATOR)}</span>;
								}}
							/>
						</Title>
					</CellContainer>
				),
				sortable: false,
			},
			{
				Header: <>{t('gov.table.votes')}</>,
				accessor: 'votes',
				Cell: (cellProps: CellProps<ProposalType>) => (
					<CellContainer>
						<Title isNumeric={true}>{cellProps.row.original.votes}</Title>
					</CellContainer>
				),
				sortable: false,
			},
		].map((c, i) => ({ ...c, width: widths[i] }));
	}, [t, mobile]);

	return (
		<Container>
			<StyledTable
				palette="primary"
				columns={columns}
				data={data}
				maxRows={5}
				isLoading={!isLoaded}
				showPagination={true}
				onTableRowClick={(row: Row<ProposalType>) => {
					setProposal(row.original);
					router.push(ROUTES.Gov.Proposal(activeTab, row.original.authorIpfsHash));
					setPanelType(PanelType.PROPOSAL);
				}}
				minHeight={isWalletConnected}
			/>
			{isWalletConnected && (
				<AbsoluteContainer
					onClick={() => {
						setPanelType(PanelType.CREATE);
						router.push(ROUTES.Gov.Create(activeTab));
					}}
				>
					<CreateButton variant="secondary">{t('gov.table.create')}</CreateButton>
				</AbsoluteContainer>
			)}
		</Container>
	);
};
export default Index;

const Container = styled.div`
	position: relative;
	height: 100%;
`;

const StyledTable = styled(Table)<{ minHeight: boolean }>`
	min-height: ${(props) => (props.minHeight ? `400px` : `0px`)};
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
			${media.lessThan('md')`
				padding-left: 0;
			`}
		}
		&:last-child {
			padding-left: 0;
		}
	}
`;

const CellContainer = styled(FlexDivCol)`
	width: 100%;
	margin-right: 15px;
`;

const Title = styled.div<{ isNumeric?: boolean }>`
	font-family: ${(props) =>
		props.isNumeric ? props.theme.fonts.mono : props.theme.fonts.interBold};
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
	${media.lessThan('mdUp')`
		overflow-x: hidden;
	`}
`;

const Status = styled.div<{ closed: boolean; pending: boolean }>`
	color: ${(props) =>
		props.closed
			? props.theme.colors.gray
			: props.pending
			? props.theme.colors.yellow
			: props.theme.colors.green};
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
`;

const AbsoluteContainer = styled.div`
	${media.greaterThan('mdUp')`
		position: absolute;
	`}
	width: 100%;
	bottom: 0px;
	margin-bottom: 24px;
	padding: 0px 16px;
`;

const CreateButton = styled(Button)`
	text-transform: uppercase;
	width: 100%;
`;
