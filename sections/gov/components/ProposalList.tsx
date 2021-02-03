import React, { useCallback, useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { CellProps, Row } from 'react-table';
import { isWalletConnectedState } from 'store/wallet';
import {
	FlexDivCol,
	TableNoResults,
	TableNoResultsButtonContainer,
	TableNoResultsTitle,
} from 'styles/common';
import Button from 'components/Button';
import { useRecoilValue } from 'recoil';
import { Proposal as ProposalType } from 'queries/gov/types';
import Connector from 'containers/Connector';
import Table from 'components/Table';
import { useTranslation } from 'react-i18next';
import Countdown from 'react-countdown';
import { useRouter } from 'next/router';
import { SPACE_KEY } from 'constants/snapshot';
import ROUTES from 'constants/routes';
import Proposal from './Proposal';

type ProposalListProps = {
	data: ProposalType[];
	isLoaded: boolean;
};

const ProposalList: React.FC<ProposalListProps> = ({ data, isLoaded }) => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const { connectWallet } = Connector.useContainer();
	const router = useRouter();
	const [proposalView, setProposalView] = useState<boolean>(false);

	const activeTab = useMemo(
		() =>
			isWalletConnected && Array.isArray(router.query.panel) && router.query.panel.length
				? (router.query.panel[0] as SPACE_KEY)
				: SPACE_KEY.COUNCIL,
		[router.query.panel, isWalletConnected]
	);

	const handleCreate = useCallback(() => {
		switch (activeTab) {
			case SPACE_KEY.COUNCIL:
				return;
		}
	}, [activeTab]);

	const columns = useMemo(
		() => [
			{
				Header: <>{t('gov.table.description')}</>,
				accessor: 'description',
				Cell: (cellProps: CellProps<ProposalType>) => (
					<CellContainer>
						<Title>{cellProps.row.original.msg.payload.name}</Title>
					</CellContainer>
				),
				width: 200,
				sortable: false,
			},
			{
				Header: <>{t('gov.table.status.title')}</>,
				accessor: 'status',
				Cell: (cellProps: CellProps<ProposalType>) => {
					const closed = cellProps.row.original.msg.payload.end < Date.now() / 1000 ? true : false;
					return (
						<CellContainer>
							<Status closed={closed}>
								{closed ? `${t('gov.table.status.closed')}` : `${t('gov.table.status.open')}`}
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
							<Countdown date={cellProps.row.original.msg.payload.end * 1000} />
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

	const returnProposal = useMemo(() => {
		return (
			<Proposal
				onBack={() => {
					setProposalView(false);
					router.push(ROUTES.Gov.Space(activeTab));
				}}
			/>
		);
	}, [activeTab]);

	return (
		<Container>
			{proposalView ? (
				returnProposal
			) : (
				<>
					<StyledTable
						palette="primary"
						columns={columns}
						data={data}
						maxRows={5}
						isLoading={isWalletConnected && !isLoaded}
						showPagination={true}
						onTableRowClick={(row: Row<ProposalType>) => {
							setProposalView(!proposalView);
							router.push(ROUTES.Gov.Proposal(activeTab, row.original.authorIpfsHash));
						}}
						noResultsMessage={
							!isWalletConnected ? (
								<TableNoResults>
									<TableNoResultsTitle>
										{t('common.wallet.no-wallet-connected')}
									</TableNoResultsTitle>
									<TableNoResultsButtonContainer>
										<Button variant="primary" onClick={connectWallet}>
											{t('common.wallet.connect-wallet')}
										</Button>
									</TableNoResultsButtonContainer>
								</TableNoResults>
							) : undefined
						}
					/>
					<AbsoluteContainer onClick={() => handleCreate()}>
						<CreateButton variant="secondary">Create ProposalType</CreateButton>
					</AbsoluteContainer>
				</>
			)}
		</Container>
	);
};
export default ProposalList;

const Container = styled.div`
	position: relative;
	height: 100%;
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
		}
		&:last-child {
			padding-left: 0;
		}
	}
`;

const CellContainer = styled(FlexDivCol)`
	width: 100%;
	margin-right: 5px;
`;

const Title = styled.div<{ isNumeric?: boolean }>`
	font-family: ${(props) =>
		props.isNumeric ? props.theme.fonts.mono : props.theme.fonts.interBold};
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
`;

const Status = styled.div<{ closed: boolean }>`
	color: ${(props) => (props.closed ? props.theme.colors.gray : props.theme.colors.green)};
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
