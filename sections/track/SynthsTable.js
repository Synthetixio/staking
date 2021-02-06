import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import { useTable, useFlexLayout, useSortBy } from 'react-table';
import { Svg } from 'react-optimized-image';
import SortDownIcon from 'assets/svg/app/sort-down.svg';
import SortUpIcon from 'assets/svg/app/sort-up.svg';
import SortIcon from 'assets/svg/app/sort.svg';
import { FlexDivCentered } from 'styles/common';

export const TABLE_PALETTE = {
	PRIMARY: 'primary',
	LIGHT: 'light-secondary',
	STRIPED: 'striped',
};

export const SynthsTable = ({
	columns = [],
	columnsDeps = [],
	data = [],
	options = {},
	noResultsMessage = null,
	onTableRowClick = undefined,
	palette = TABLE_PALETTE.STRIPED,
	isLoading = false,
	className,
}) => {
	const memoizedColumns = useMemo(
		() => columns,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		columnsDeps
	);
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
		{
			columns: memoizedColumns,
			data,
			...options,
		},
		useSortBy,
		useFlexLayout
	);

	return (
		<ReactTable {...getTableProps()} palette={palette} className={className}>
			{headerGroups.map((headerGroup) => (
				<TableRow className="table-row" {...headerGroup.getHeaderGroupProps()}>
					{headerGroup.headers.map((column) => (
						<TableCellHead
							{...column.getHeaderProps(
								column.sortable ? column.getSortByToggleProps() : undefined
							)}
						>
							{column.render('Header')}
							{column.sortable && (
								<SortIconContainer>
									{column.isSorted ? (
										column.isSortedDesc ? (
											<Svg src={SortDownIcon} width="8" />
										) : (
											<Svg src={SortUpIcon} width="8" />
										)
									) : (
										<Svg src={SortIcon} width="8" />
									)}
								</SortIconContainer>
							)}
						</TableCellHead>
					))}
				</TableRow>
			))}
			{noResultsMessage != null ? (
				noResultsMessage
			) : isLoading ? (
				<h1>Loading!!</h1>
			) : (
				<TableBody className="table-body" {...getTableBodyProps()}>
					{rows.map((row) => {
						prepareRow(row);

						return (
							<TableBodyRow
								className="table-body-row"
								{...row.getRowProps()}
								onClick={onTableRowClick ? () => onTableRowClick(row) : undefined}
							>
								{row.cells.map((cell) => (
									<TableCell className="table-body-cell" {...cell.getCellProps()}>
										{cell.render('Cell')}
									</TableCell>
								))}
							</TableBodyRow>
						);
					})}
				</TableBody>
			)}
		</ReactTable>
	);
};

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
	text-transform: uppercase;
`;

const SortIconContainer = styled.span`
	display: flex;
	align-items: center;
	margin-left: 5px;
`;

const ReactTable = styled.div`
	width: 100%;
	height: 100%;
	overflow-x: auto;
	position: relative;

	${(props) =>
		props.palette === TABLE_PALETTE.STRIPED &&
		css`
			${TableBody} {
				max-height: calc(100% - 48px);
			}
			${TableCell} {
				color: ${(props) => props.theme.colors.tableBody};
				font-size: 14px;
				height: 40px;
				&:not(:first-child) {
					justify-content: flex-end;
				}
			}
			${TableCellHead} {
				color: ${(props) => props.theme.colors.body};
				font-family: ${(props) => props.theme.fonts.interBold};
				background-color: ${(props) => props.theme.colors.surfaceL3};
			}
			${TableBodyRow} {
				&:nth-child(odd) {
					background-color: ${(props) => props.theme.colors.listBackgroundFocus};
				}
			}
		`}

	${(props) =>
		props.palette === TABLE_PALETTE.LIGHT &&
		css`
			${TableBody} {
				max-height: calc(100% - 56px);
			}
			${TableCell} {
				font-size: 14px;

				height: 56px;
			}
			${TableRow} {
				margin-bottom: 8px;
			}
			${TableCellHead} {
				font-family: ${(props) => props.theme.fonts.interBold};
				font-size: 12px;
			}
			${TableBodyRow} {
				&:hover {
					transition: box-shadow 0.2s ease-in-out;
					box-shadow: rgba(188, 99, 255, 0.08) 0px 4px 6px;
				}
			}
		`}
`;

export default SynthsTable;
