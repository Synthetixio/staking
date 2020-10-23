import { ReactNode } from 'react';
import styled from 'styled-components';

import { resetButtonCSS } from 'styles/common';

type TabProps = {
	name: string;
	active: boolean;
	onClick?: () => void;
	children: ReactNode;
	numberTabs: number;
};

export const TabButton = (props: TabProps) => (
	<StyledTabButton
		id={`${props.name}-tab`}
		role="tab"
		aria-selected={props.active}
		aria-controls={`${props.name}-tabpanel`}
		tabIndex={-1}
		{...props}
	/>
);

export const TabList = ({ children, width, ...props }: { children: ReactNode; width: number }) => (
	<StyledTabList width={width} {...props}>
		{children}
	</StyledTabList>
);

export const TabPanel = ({
	name,
	activeTab,
	children,
	height,
	width,
	...props
}: {
	name: string;
	activeTab: string;
	children: ReactNode;
	height: number;
	width: number;
}) =>
	activeTab === name ? (
		<TabPanelContainer
			id={`${name}-tabpanel`}
			role="tabpanel"
			aria-labelledby={`${name}-tab`}
			tabIndex={-1}
			height={height}
			width={width}
			{...props}
		>
			{children}
		</TabPanelContainer>
	) : null;

const TabPanelContainer = styled.div<{ height: number; width: number }>`
	outline: none;
	background: ${(props) => props.theme.colors.backgroundBlue};
	box-shadow: 0px 0px 20px ${(props) => props.theme.colors.backgroundBoxShadow};
	height: ${(props) => props.height}px;
	width: ${(props) => props.width}px;
`;

const StyledTabButton = styled.button<TabProps>`
	${resetButtonCSS};
	font-family: ${(props) => props.theme.fonts.condensedBold};
	padding: 0;
	background: ${(props) => props.theme.colors.backgroundBlue};
	color: ${(props) => (props.active ? props.theme.colors.white : props.theme.colors.gray)};
	border-top: ${(props) => (props.active ? `2px solid ${props.theme.colors.brightBlue}` : 'none')};
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
	height: 60px;
	width: ${(props) => 100 / props.numberTabs}%;
`;

const StyledTabList = styled.div.attrs({ role: 'tablist' })<{ width: number }>`
	width: ${(props) => props.width}px;
`;
