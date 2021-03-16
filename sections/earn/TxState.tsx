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
	isStakingPanelWaitingScreen?: boolean;
};

const TxState: FC<TxStateProps> = ({
	description,
	title,
	content,
	isStakingPanel = false,
	isStakingPanelWaitingScreen = false,
}) => (
	<Container isStakingPanel={isStakingPanel}>
		{description != null ? <Description>{description}</Description> : null}
		<InnerContainer
			isStakingPanelWaitingScreen={isStakingPanelWaitingScreen}
			isStakingPanel={isStakingPanel}
		>
			<Title isStakingPanel={isStakingPanel}>{title}</Title>
			{content}
		</InnerContainer>
	</Container>
);

const Container = styled.div<{ isStakingPanel: boolean }>`
	z-index: ${zIndex.DIALOG_OVERLAY};
	justify-content: space-around;
	height: 375px;
	background: ${(props) => props.theme.colors.navy};
	padding: 20px;

	${(props) =>
		props.isStakingPanel &&
		css`
			height: 240px;
		`}
`;

const InnerContainer = styled(FlexDivColCentered)<{
	isStakingPanel: boolean;
	isStakingPanelWaitingScreen: boolean;
}>`
	margin: ${(props) => (props.isStakingPanel ? '-20px' : '20px 0 0 0')};
	padding: ${(props) => (props.isStakingPanelWaitingScreen ? '20px' : '25px')};
	background: ${(props) => props.theme.colors.black};
`;

const Description = styled.div`
	font-size: 14px;
	color: ${(props) => props.theme.colors.gray};
`;

export default TxState;
