import React, { FC } from 'react';
import styled, { css } from 'styled-components';
import { useTable, useFlexLayout, useSortBy, Column, Row, usePagination, Cell } from 'react-table';
import { Svg } from 'react-optimized-image';

import SortDownIcon from 'assets/svg/app/caret-down.svg';
import SortUpIcon from 'assets/svg/app/caret-up.svg';

import { FlexDivCentered } from 'styles/common';

import Spinner from 'assets/svg/app/loader.svg';
import Pagination from './Pagination';

export type TablePalette = 'primary';

const CARD_HEIGHT = '40px';
const MAX_PAGE_ROWS = 12;

type ColumnWithSorting<D extends object = {}> = Column<D> & {
	sortType?: string | ((rowA: Row<any>, rowB: Row<any>) => -1 | 1);
	sortable?: boolean;
};

type TableProps = {
	palette?: TablePalette;
	data: object[];
	columns: ColumnWithSorting<object>[];
	options?: any;
	onTableRowClick?: (row: Row<any>) => void;
	isActiveRow?: (row: Row<any>) => boolean;
	className?: string;
	isLoading?: boolean;
	noResultsMessage?: React.ReactNode;
	showPagination?: boolean;
	maxRows?: number;
};

export const Table: FC<TableProps> = ({
	columns = [],
	data = [],
	options = {},
	noResultsMessage = null,
	onTableRowClick = undefined,
	palette = 'primary',
	isLoading = false,
	className,
	showPagination = false,
	isActiveRow,
	maxRows = MAX_PAGE_ROWS,
}) => {
	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		page,
		prepareRow,
		canPreviousPage,
		canNextPage,
		pageCount,
		gotoPage,
		nextPage,
		previousPage,
		state: { pageIndex },
	} = useTable(
		{
			columns,
			data,
			initialState: { pageSize: showPagination ? maxRows : data.length },
			...options,
		},
		useSortBy,
		usePagination,
		useFlexLayout
	);

	return (
		<>
			<TableContainer>
				<ReactTable {...getTableProps()} palette={palette} className={className}>
					{headerGroups.map((headerGroup) => (
						<TableRow className="table-row" {...headerGroup.getHeaderGroupProps()}>
							{headerGroup.headers.map((column: any) => (
								<TableCellHead
									{...column.getHeaderProps(
										column.sortable ? column.getSortByToggleProps() : undefined
									)}
									className="table-header-cell"
								>
									{column.render('Header')}
									{column.sortable && (
										<SortIconContainer>
											{column.isSorted && column.isSortedDesc && (
												<StyledSortIcon
													src={SortDownIcon}
													viewBox={`0 0 ${SortDownIcon.width} ${SortDownIcon.height}`}
												/>
											)}
											{column.isSorted && !column.isSortedDesc && (
												<StyledSortIcon
													src={SortUpIcon}
													viewBox={`0 0 ${SortUpIcon.width} ${SortUpIcon.height}`}
												/>
											)}
											{!column.isSorted && (
												<>
													<StyledSortIcon
														src={SortUpIcon}
														viewBox={`0 0 ${SortUpIcon.width} ${SortUpIcon.height}`}
													/>
													<StyledSortIcon
														src={SortDownIcon}
														viewBox={`0 0 ${SortDownIcon.width} ${SortDownIcon.height}`}
													/>
												</>
											)}
										</SortIconContainer>
									)}
								</TableCellHead>
							))}
						</TableRow>
					))}
					{isLoading ? (
						<StyledSpinner src={Spinner} />
					) : (
						page.length > 0 && (
							<TableBody className="table-body" {...getTableBodyProps()}>
								{page.map((row: Row) => {
									prepareRow(row);

									const rowActive = isActiveRow ? isActiveRow(row) : undefined;
									const classNames = ['table-body-row'];
									if (rowActive) {
										classNames.push('active-row');
									}
									return (
										<TableBodyRow
											className={classNames.join(' ')}
											{...row.getRowProps()}
											onClick={onTableRowClick ? () => onTableRowClick(row) : undefined}
										>
											{row.cells.map((cell: Cell) => (
												<TableCell className="table-body-cell" {...cell.getCellProps()}>
													{cell.render('Cell')}
												</TableCell>
											))}
										</TableBodyRow>
									);
								})}
							</TableBody>
						)
					)}
				</ReactTable>
			</TableContainer>
			{noResultsMessage}
			{showPagination ? (
				<Pagination
					pageIndex={pageIndex}
					pageCount={pageCount}
					canNextPage={canNextPage}
					canPreviousPage={canPreviousPage}
					setPage={gotoPage}
					previousPage={previousPage}
					nextPage={nextPage}
				/>
			) : undefined}
		</>
	);
};

const TableContainer = styled.div`
	overflow: auto;
`;

// @ts-ignore
const StyledSpinner = styled(Svg)`
	display: block;
	margin: 30px auto;
`;

export const TableRow = styled.div``;

const TableBody = styled.div`
	overflow-y: auto;
	overflow-x: hidden;
`;

const TableBodyRow = styled(TableRow)`
	cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
`;

const TableCell = styled(FlexDivCentered)`
	box-sizing: border-box;
	&:first-child {
		padding-left: 18px;
	}
	&:last-child {
		padding-right: 18px;
	}
`;

const TableCellHead = styled(TableCell)`
	user-select: none;
`;

const SortIconContainer = styled.span`
	display: flex;
	margin-left: 5px;
	flex-direction: column;
`;

const ReactTable = styled.div<{ palette: TablePalette }>`
	width: 100%;
	height: 100%;
	overflow-x: auto;
	position: relative;

	${(props) =>
		props.palette === 'primary' &&
		css`
			${TableBody} {
				max-height: calc(100% - ${CARD_HEIGHT});
			}
			${TableCell} {
				color: ${(props) => props.theme.colors.white};
				font-size: 12px;
				height: ${CARD_HEIGHT};
			}
			${TableRow} {
				background-color: ${(props) => props.theme.colors.navy};
				border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
			}
			${TableCellHead} {
				color: ${(props) => props.theme.colors.white};
				background-color: ${(props) => props.theme.colors.navy};
				font-family: ${(props) => props.theme.fonts.condensedBold};
				color: ${(props) => props.theme.colors.gray};
				text-transform: uppercase;
				font-size: 12px;
			}
			${TableBodyRow} {
				background-color: ${(props) => props.theme.colors.navy};
				&:last-child {
					border-bottom: 0;
				}
				&.active-row {
					background-color: ${props.theme.colors.mediumBlue};
				}
			}
		`}
`;

const StyledSortIcon = styled(Svg)`
	width: 5px;
	height: 5px;
	color: ${(props) => props.theme.colors.gray};
`;

export default Table;
