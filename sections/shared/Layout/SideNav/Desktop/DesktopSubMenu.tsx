import { FC } from 'react';
import styled, { css } from 'styled-components';
import { FlexDivColCentered } from 'styles/common';
import { DESKTOP_SIDE_NAV_WIDTH } from 'constants/ui';
import media from 'styles/media';

const DesktopSubMenu: FC = ({ children }) => (
	<SubContainer className="subLink">
		<Inner>{children}</Inner>
	</SubContainer>
);

console.log(DESKTOP_SIDE_NAV_WIDTH);

export const SubContainer = styled(FlexDivColCentered)`
	justify-content: center;
	height: 100%;
	width: 128px;
	background: ${(props) => props.theme.colors.darkGradient1};
	position: fixed;
	display: none;
	top: 0px;
	bottom: 0px;
	transform: translateX(${DESKTOP_SIDE_NAV_WIDTH});
	border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
	transition: all 0.15s ease-in-out;
	zindex: 2000;
`;

export const SubMenuLinkItem = styled.div<{ isActive: boolean }>`
	line-height: 40px;
	padding-bottom: 10px;
	position: relative;
	white-space: nowrap;
	display: flex;
	align-items: center;
	text-decoration: none;
	&:hover {
		text-decoration: none;
	}
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	text-transform: uppercase;
	opacity: 0.4;
	font-size: 14px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.white};
	&:hover {
		opacity: unset;
		color: ${(props) => props.theme.colors.blue};
	}
	${(props) =>
		props.isActive &&
		css`
			opacity: unset;
		`}

	${media.lessThan('md')`
		font-family: ${(props) => props.theme.fonts.extended};
		font-size: 20px;
		opacity: 1;
	`}
`;

const Inner = styled.div`
	position: relative;
	height: 100%;
	width: 100%;
	background: ${(props) => props.theme.colors.darkGradient1};
`;

export default DesktopSubMenu;
