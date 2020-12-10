import { ReactNode } from 'react';
import styled, { css } from 'styled-components';

import { resetButtonCSS } from 'styles/common';

type TabProps = {
	name: string;
	active: boolean;
	onClick?: () => void;
	children: ReactNode;
	numberTabs: number;
	blue: boolean;
	tabHeight?: number;
	inverseTabColor?: boolean;
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

export const TabList = ({
	children,
	width,
	padding,
	...props
}: {
	children: ReactNode;
	width: number;
	padding: number;
}) => (
	<StyledTabList padding={padding} width={width} {...props}>
		{children}
	</StyledTabList>
);

export const TabPanel = ({
	name,
	activeTab,
	children,
	height,
	width,
	padding,
	...props
}: {
	name: string;
	activeTab: string;
	children: ReactNode;
	height: number;
	width: number;
	padding: number;
}) =>
	activeTab === name ? (
		<TabPanelContainer
			id={`${name}-tabpanel`}
			role="tabpanel"
			aria-labelledby={`${name}-tab`}
			tabIndex={-1}
			height={height}
			width={width}
			padding={padding}
			{...props}
		>
			{children}
		</TabPanelContainer>
	) : null;

const TabPanelContainer = styled.div<{ height: number; width: number; padding: number }>`
	outline: none;
	background: ${(props) => props.theme.colors.backgroundBlue};
	box-shadow: 0px 0px 20px ${(props) => props.theme.colors.backgroundBoxShadow};
	height: ${(props) => props.height}px;
	width: ${(props) => props.width}px;
	padding: ${(props) => props.padding}px;
`;

const StyledTabButton = styled.button<TabProps>`
	${resetButtonCSS};
	font-family: ${(props) => props.theme.fonts.condensedBold};
	padding: 0;
	background: ${(props) =>
		props.active
			? props.inverseTabColor
				? props.theme.colors.black
				: props.theme.colors.backgroundBlue
			: props.inverseTabColor
			? props.theme.colors.backgroundBlue
			: props.theme.colors.black};
	color: ${(props) => (props.active ? props.theme.colors.white : props.theme.colors.gray)};

	${(props) =>
		props.blue
			? css`
					border-top: ${props.active ? `2px solid ${props.theme.colors.blue}` : 'none'};
			  `
			: css`
					border-top: ${props.active ? `2px solid ${props.theme.colors.orange}` : 'none'};
			  `}

	&:hover {
		color: ${(props) => (props.active ? props.theme.colors.white : props.theme.colors.pink)};
		background: ${(props) =>
			props.inverseTabColor ? props.theme.colors.black : props.theme.colors.backgroundBlue};

		border-top: 2px solid ${(props) => (props.active ? 'none' : props.theme.colors.pink)};
	}
	height: ${(props) => (props.tabHeight ? `${props.tabHeight}px` : '60px')};
	width: ${(props) => 100 / props.numberTabs}%;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const StyledTabList = styled.div.attrs({ role: 'tablist' })<{ width: number; padding: number }>`
	width: ${(props) => props.width}px;
	display: flex;
`;
