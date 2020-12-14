import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';

import { FlexDivColCentered } from 'styles/common';
import { zIndex } from 'constants/ui';

import { Title } from './common';

type TxStateProps = {
	title: string;
	content: ReactNode;
	description?: ReactNode;
	isStakingPanel?: boolean;
};

const TxState: FC<TxStateProps> = ({ description, title, content, isStakingPanel = false }) => (
	<Container isStakingPanel={isStakingPanel}>
		{description != null ? <Description>{description}</Description> : null}
		<InnerContainer isStakingPanel={isStakingPanel}>
			<Title>{title}</Title>
			{content}
		</InnerContainer>
	</Container>
);

const Container = styled.div<{ isStakingPanel: boolean }>`
	z-index: ${zIndex.DIALOG_OVERLAY};
	justify-content: space-around;
	position: absolute;
	width: 575px;
	height: 375px;
	background: ${(props) => props.theme.colors.navy};
	padding: 20px;

	${(props) =>
		props.isStakingPanel &&
		css`
			width: 270px;
			height: 240px;
			overflow-y: scroll;
			overflow-x: hidden;
		`}
`;

const InnerContainer = styled(FlexDivColCentered)<{ isStakingPanel: boolean }>`
	margin-top: ${(props) => (props.isStakingPanel ? '0' : '20px')};
	padding: 25px;
	background: ${(props) => props.theme.colors.black};
`;

const Description = styled.div`
	font-size: 14px;
	color: ${(props) => props.theme.colors.gray};
`;

export default TxState;
