import styled from 'styled-components';

import { FlexDivColCentered } from 'styles/common';

const ManageTab = () => {
	return (
		<ManageContainer>
			Debt mirror
			<ManageSubtitle>Coming soon</ManageSubtitle>
		</ManageContainer>
	);
};

const ManageContainer = styled(FlexDivColCentered)`
	height: 100%;
	justify-content: center;
	background: ${(props) => props.theme.colors.navy};

	font-family: ${(props) => props.theme.fonts.extended};
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.mutedGray};
`;

const ManageSubtitle = styled.p`
	text-transform: none;
	font-family: ${(props) => props.theme.fonts.regular};
`;

export default ManageTab;
