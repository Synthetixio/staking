import { FC } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { FlexDivColCentered } from 'styles/common';
import { SIDE_NAV_WIDTH } from 'constants/ui';

import { linkCSS } from 'styles/common';
import { SubMenuLink } from 'sections/shared/Layout/constants';

type SubMenuConfiguration = {
	routes: SubMenuLink[] | null;
	topPosition: number | null;
};

type SubMenuProps = {
	config: SubMenuConfiguration;
	currentPath: string;
};

const SubMenu: FC<SubMenuProps> = ({ config, currentPath }) => {
	const { t } = useTranslation();
	return typeof document !== 'undefined'
		? createPortal(
				<Container isVisible={!!config?.routes ?? false}>
					<Inner>
						<FloatingContent topPosition={config?.topPosition ?? 0}>
							<LinkList>
								{config?.routes?.map(({ i18nLabel, subLink }, i) => (
									<MenuLinkItem key={`subMenuLinkItem-${i}`} isActive={currentPath === subLink}>
										<Link href={subLink}>
											<a data-testid={`sidenav-submenu-${subLink}`}>{t(i18nLabel)}</a>
										</Link>
									</MenuLinkItem>
								)) ?? null}
							</LinkList>
						</FloatingContent>
					</Inner>
				</Container>,
				document.body
		  )
		: null;
};

const MenuLinkItem = styled.div<{ isActive: boolean }>`
	line-height: 40px;
	padding-bottom: 10px;
	position: relative;

	a {
		white-space: nowrap;
		display: flex;
		align-items: center;
		${linkCSS};
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
	}
`;

const LinkList = styled.div``;

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
			transform: translateX(calc(${SIDE_NAV_WIDTH}));
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

export default SubMenu;
