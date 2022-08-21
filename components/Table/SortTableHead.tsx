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
        <SortUpIcon width="5" />
        <SortDownIcon width="5" />
      </>
    );
  } else if (isSortedDesc) {
    sortIcon = <SortDownIcon width="5" />;
  } else {
    sortIcon = <SortUpIcon width="5" />;
  }

  return <SortIconContainer>{sortIcon}</SortIconContainer>;
};

const SortIconContainer = styled.span`
  display: flex;
  margin-left: 5px;
  flex-direction: column;
  color: ${(props) => props.theme.colors.gray};
`;
