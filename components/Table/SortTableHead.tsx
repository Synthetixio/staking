import React, { FC } from 'react';
import styled from 'styled-components';

import SortDownIcon from 'assets/svg/app/caret-down.svg';
import SortUpIcon from 'assets/svg/app/caret-up.svg';

type SortTableHeadProps = {
	sortable: boolean;
	isSorted: boolean;
	isSortedDesc: boolean;
};

export const SortTableHead: FC<SortTableHeadProps> = ({ sortable, isSorted, isSortedDesc }) => {
	if (!sortable) return null;

	let sortIcon;
	if (!isSorted) {
		sortIcon = (
			<>
				<StyledSortIcon alt="Sort up" src={SortUpIcon} />
				<StyledSortIcon alt="Sort down" src={SortDownIcon} />
			</>
		);
	} else if (isSortedDesc) {
		sortIcon = <StyledSortIcon alt="Sort down" src={SortDownIcon} />;
	} else {
		sortIcon = <StyledSortIcon alt="Sort up" src={SortUpIcon} />;
	}

	return <SortIconContainer>{sortIcon}</SortIconContainer>;
};

const SortIconContainer = styled.span`
	display: flex;
	margin-left: 5px;
	flex-direction: column;
`;

const StyledSortIcon = styled.img`
	width: 5px;
	height: 5px;
	color: ${(props) => props.theme.colors.gray};
`;
