import React from 'react';
import styled from 'styled-components';

import { TabContainer } from '../common';

type StakingRewardsTabProps = {
	canVestAmount: number;
};

const StakingRewardsTab: React.FC<StakingRewardsTabProps> = ({ canVestAmount }) => {
	return (
		<>
			<TabContainer>
				<Data>{canVestAmount} SNX</Data>
			</TabContainer>
		</>
	);
};

const Data = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 24px;
`;

export default StakingRewardsTab;
