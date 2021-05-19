import React, { useMemo } from 'react';
import styled from 'styled-components';
import { CellProps, Row } from 'react-table';
import { isWalletConnectedState } from 'store/wallet';
import { FlexDivCol } from 'styles/common';
import Button from 'components/Button';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Proposal as ProposalType } from 'queries/gov/types';
import Table from 'components/Table';
import { useTranslation } from 'react-i18next';
import Countdown from 'react-countdown';
import { useRouter } from 'next/router';
import ROUTES from 'constants/routes';
import { panelState, PanelType, proposalState } from 'store/gov';
import { DURATION_SEPARATOR } from 'constants/date';
import { getCurrentTimestampSeconds } from 'utils/formatters/date';
import useProposals from 'queries/gov/useProposals';
import { SPACE_KEY } from 'constants/snapshot';

type IndexProps = {
	spaceKey: SPACE_KEY;
};

const Index: React.FC<IndexProps> = ({ spaceKey }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const setProposal = useSetRecoilState(proposalState);
	const setPanelType = useSetRecoilState(panelState);
	const proposals = useProposals(spaceKey);

	const columns = useMemo(
		() => [
			{
				Header: <>{t('gov.table.description')}</>,
				accessor: 'description',
				Cell: (cellProps: CellProps<ProposalType>) => (
					<CellContainer>
						<Title>{cellProps.row.original.title}</Title>
					</CellContainer>
				),
				width: 200,
				sortable: false,
			},
			{
				Header: <>{t('gov.table.status.title')}</>,
				accessor: 'status',
				Cell: (cellProps: CellProps<ProposalType>) => {
					const currentTimestampSeconds = getCurrentTimestampSeconds();
					const closed = cellProps.row.original.end < currentTimestampSeconds ? true : false;
					const pending = currentTimestampSeconds < cellProps.row.original.start ? true : false;
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
				width: 75,
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
								date={cellProps.row.original.end * 1000}
								renderer={({ days, hours, minutes }) => {
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
				width: 100,
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
				width: 75,
				sortable: false,
			},
		],
		[t]
	);

	return (
		<Container>
			<StyledTable
				palette="primary"
				columns={columns}
				data={proposals.data ?? []}
				maxRows={5}
				isLoading={proposals.isLoading}
				showPagination={true}
				onTableRowClick={(row: Row<ProposalType>) => {
					setProposal(row.original);
					router.push(ROUTES.Gov.Proposal(spaceKey, row.original.id));
					setPanelType(PanelType.PROPOSAL);
				}}
				minHeight={isWalletConnected}
			/>
			{isWalletConnected && (
				<AbsoluteContainer
					onClick={() => {
						setPanelType(PanelType.CREATE);
						router.push(ROUTES.Gov.Create(spaceKey));
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
	position: absolute;
	width: 100%;
	bottom: 0px;
	margin-bottom: 24px;
	padding: 0px 16px;
`;

const CreateButton = styled(Button)`
	text-transform: uppercase;
	width: 100%;
`;
