import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { truncateAddress } from 'utils/formatters/string';
import { CellProps } from 'react-table';
import { useDelegates } from 'sections/delegate/contexts/delegates';
import { DelegateApproval } from 'queries/delegate/types';
import Table from 'components/Table';
import { ExternalLink } from 'styles/common';
import { Svg } from 'react-optimized-image';
import WalletIcon from 'assets/svg/app/wallet-yellow.svg';
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
					return truncateAddress(delegateAddress, 5, 3);
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
				<Svg src={WalletIcon} />
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
						<ExternalLink href="https://sips.synthetix.io/sips/sip-14">
							{t('delegate.info.learn-more')}
						</ExternalLink>
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
