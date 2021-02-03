import React from 'react';
import styled from "styled-components";
import { Svg } from "react-optimized-image";
import {
	FlexDivRowCentered,
	IconButton,
} from 'styles/common';

import NavigationBack from 'assets/svg/app/navigation-back.svg';

import { InputContainer } from 'sections/gov/components/common';

type ProposalProps = {
  onBack: Function;
};

const Proposal: React.FC<ProposalProps> = ({onBack}) => {
	return (
		<>
			<InputContainer>
      <HeaderRow>
					<IconButton onClick={() => onBack(null)}>
						<Svg src={NavigationBack} />
					</IconButton>
        
				</HeaderRow>
      </InputContainer>
		</>
	);
};
export default Proposal;


const HeaderRow = styled(FlexDivRowCentered)`
	justify-content: space-between;
	width: 100%;
	padding: 8px;
`;
