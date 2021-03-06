import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import { Title, Container, InputContainer } from './common';

type TxStateProps = {
	title: string;
	content: ReactNode;
};

const TxState: FC<TxStateProps> = ({ title, content }) => (
	<Container>
		<InnerContainer>
			<Title>{title}</Title>
			{content}
		</InnerContainer>
	</Container>
);

const InnerContainer = styled(InputContainer)`
	padding: 40px 0px;
	margin: 0px;
	height: 300px;
	background: ${(props) => props.theme.colors.black};
`;

export default TxState;
