import { FC } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { FlexDivColCentered } from 'styles/common';
import media from 'styles/media';
import { DESKTOP_SIDE_NAV_WIDTH, MOBILE_SIDE_NAV_WIDTH } from 'constants/ui';
import UIContainer from 'containers/UI';

import SubMenu from './SubMenu';

const DesktopSubMenu: FC = () => {
	const { isShowingSubMenu, subMenuConfiguration } = UIContainer.useContainer();

	return typeof document !== 'undefined'
		? createPortal(
				<Container isVisible={isShowingSubMenu}>
					<Inner>
						<FloatingContent topPosition={subMenuConfiguration?.topPosition ?? 0}>
							<SubMenu />
						</FloatingContent>
					</Inner>
				</Container>,
				document.body
		  )
		: null;
};

const Container = styled(FlexDivColCentered)<{ isVisible: boolean }>`
	justify-content: center;
	height: 100%;
	width: 128px;
	background: ${(props) => props.theme.colors.darkGradient1};
	position: fixed;
	top: 0;
	bottom: 0;
	transform: translateX(-100%);
	border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
	transition: all 0.15s ease-in-out;
	${(props) =>
		props.isVisible &&
		css`
			transform: translateX(calc(${MOBILE_SIDE_NAV_WIDTH}px));

			${media.greaterThan('mdUp')`
				transform: translateX(calc(${DESKTOP_SIDE_NAV_WIDTH}px));
			`}
		`}
`;

const Inner = styled.div`
	position: relative;
	height: 100%;
	width: 100%;
`;

const FloatingContent = styled.div<{ topPosition: number }>`
	position: absolute;
	top: ${(props) => props.topPosition}px;
	left: 50%;
	transform: translateX(-50%);
`;

export default DesktopSubMenu;
