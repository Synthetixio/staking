import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CellProps } from 'react-table';
import { useDelegates } from 'sections/delegate/contexts/delegates';
import { DelegateApproval } from 'queries/delegate/types';
import Table from 'components/Table';
import RevokeDelegate from './RevokeDelegate';
import { RIGHT_COL_WIDTH } from './constants';

const RightCol: FC = () => {
	const { t } = useTranslation();

	const { isLoadingDelegates: isLoading, delegateApprovals, getActionByBytes } = useDelegates();

	const columns = useMemo(
		() => [
			{
				Header: <>{t('delegate.list.cols.delegate')}</>,
				accessor: 'delegate',
				width: 100,
				sortable: true,
				Cell: (cellProps: CellProps<DelegateApproval>) => {
					const delegateAddress = cellProps.value;
					return `${delegateAddress.slice(0, 4)}....${delegateAddress.slice(-2)}`;
				},
			},
			{
				Header: <>{t('delegate.list.cols.action')}</>,
				accessor: 'action',
				width: 100,
				sortable: true,
				Cell: (cellProps: CellProps<DelegateApproval>) => {
					const action = getActionByBytes(cellProps.value);
					return action ? t(`common.delegate-actions.actions.${action}`) : '-';
				},
			},
			{
				Header: <>{t('delegate.list.cols.actions')}</>,
				id: 'actions',
				sortable: false,
				width: RIGHT_COL_WIDTH - 200 - 50,
				Cell: (cellProps: CellProps<DelegateApproval>) => (
					<RevokeDelegate delegateApproval={cellProps.row.original} />
				),
			},
		],
		[t, getActionByBytes]
	);

	const noResultsMessage =
		!isLoading && delegateApprovals.length === 0 ? (
			<ListTableEmptyMessage>
				<svg
					width="38"
					height="32"
					viewBox="0 0 38 32"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M37.0261 4.9158H35.0566V0.787789C35.0566 0.578855 34.9736 0.378477 34.8259 0.230738C34.6781 0.0829988 34.4778 0 34.2688 0H3.24569C2.38552 0.00208023 1.56117 0.344704 0.952939 0.952939C0.344704 1.56117 0.00208023 2.38552 0 3.24569V28.7543C0.00208023 29.6145 0.344704 30.4388 0.952939 31.0471C1.56117 31.6553 2.38552 31.9979 3.24569 32H37.0261C37.235 32 37.4354 31.917 37.5831 31.7693C37.7309 31.6215 37.8139 31.4211 37.8139 31.2122V5.70359C37.8139 5.49466 37.7309 5.29428 37.5831 5.14654C37.4354 4.9988 37.235 4.9158 37.0261 4.9158ZM3.24569 1.57558H33.481V4.9158H3.24569C2.80275 4.9158 2.37795 4.73985 2.06474 4.42664C1.75154 4.11343 1.57558 3.68863 1.57558 3.24569C1.57558 2.80275 1.75154 2.37795 2.06474 2.06474C2.37795 1.75154 2.80275 1.57558 3.24569 1.57558ZM3.24569 30.4244C2.80275 30.4244 2.37795 30.2485 2.06474 29.9353C1.75154 29.6221 1.57558 29.1972 1.57558 28.7543V6.01083C2.07623 6.3244 2.65495 6.49091 3.24569 6.49138H36.2383V13.936H25.4692C24.2971 13.936 23.173 14.4016 22.3442 15.2304C21.5154 16.0592 21.0497 17.1834 21.0497 18.3555C21.0497 19.5276 21.5154 20.6517 22.3442 21.4805C23.173 22.3094 24.2971 22.775 25.4692 22.775H36.2383V30.4244H3.24569ZM36.2383 21.1994H25.4692C24.715 21.1994 23.9916 20.8998 23.4583 20.3664C22.9249 19.8331 22.6253 19.1097 22.6253 18.3555C22.6253 17.6012 22.9249 16.8779 23.4583 16.3445C23.9916 15.8112 24.715 15.5116 25.4692 15.5116H36.2383V21.1994Z"
						fill="#FFD75C"
					/>
				</svg>

				{t('delegate.list.empty')}
			</ListTableEmptyMessage>
		) : null;

	return (
		<Root>
			<Container>
				<ContainerHeader>
					<Title>{t('delegate.info.title')}</Title>
					<Subtitle>
						{t('delegate.info.subtitle')}{' '}
						<a href="https://sips.synthetix.io/sips/sip-14" target="_blank" rel="noreferrer">
							{t('delegate.info.learn-more')}
						</a>
					</Subtitle>
				</ContainerHeader>
			</Container>

			<Container>
				<ContainerHeader>
					<ListTitle>{t('delegate.list.title')}</ListTitle>

					<ListTable
						palette="primary"
						{...{ isLoading, columns }}
						data={delegateApprovals}
						noResultsMessage={noResultsMessage}
						showPagination={true}
					/>
				</ContainerHeader>
			</Container>
		</Root>
	);
};

export default RightCol;

//

export const Root = styled.div`
	& > div {
		margin-bottom: 32px;
	}

	a,
	a:visited {
		color: ${(props) => props.theme.colors.blue};
		text-decoration: none;
	}
`;

export const Container = styled.div`
	background: ${(props) => props.theme.colors.navy};
`;

export const ContainerHeader = styled.div`
	padding: 16px;
`;

export const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.extended};
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
`;
export const Subtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;
	margin-top: 12px;
`;

const ListTable = styled(Table)`
	.table-row,
	.table-body-row {
		& > :last-child {
			justify-content: flex-end;
		}
	}

	.table-body {
		min-height: 300px;
	}
`;

const ListTitle = styled(Title)`
	text-transform: uppercase;
`;

const ListTableEmptyMessage = styled.div`
	font-size: 12px;
	padding: 20px 0 0;
	display: flex;
	flex-direction: column;
	justify-items: space-around;
	align-items: center;
	color: white;

	svg {
		margin-bottom: 10px;
	}
`;
