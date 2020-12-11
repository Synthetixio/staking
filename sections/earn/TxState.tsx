import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import { FlexDivColCentered } from 'styles/common';
import { zIndex } from 'constants/ui';

import { Title } from './common';

type TxStateProps = {
	title: string;
	content: ReactNode;
	description: ReactNode;
};

const TxState: FC<TxStateProps> = ({ description, title, content }) => (
	<Container>
		<Description>{description}</Description>
		<InnerContainer>
			<Title>{title}</Title>
			{content}
		</InnerContainer>
	</Container>
);

const Container = styled.div`
	z-index: ${zIndex.DIALOG_OVERLAY};
	justify-content: space-around;
	position: absolute;
	width: 575px;
	height: 375px;
	background: ${(props) => props.theme.colors.navy};
	padding: 20px;
`;

const InnerContainer = styled(FlexDivColCentered)`
	margin-top: 20px;
	padding: 25px;
	background: ${(props) => props.theme.colors.black};
`;

const Description = styled.div`
	font-size: 14px;
	color: ${(props) => props.theme.colors.gray};
`;

export default TxState;
