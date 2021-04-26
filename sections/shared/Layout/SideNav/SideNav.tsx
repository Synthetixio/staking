import styled, { css } from 'styled-components';
import { FC, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';

import SideNavContainer from 'containers/SideNav';
import { isL2State } from 'store/wallet';
import { linkCSS } from 'styles/common';
import media from 'styles/media';
import CaretRightIcon from 'assets/svg/app/caret-right-small.svg';
import ROUTES from 'constants/routes';
import { addOptimismNetworkToMetamask } from '@synthetixio/optimism-networks';
import { isWalletConnectedState } from 'store/wallet';

import { MENU_LINKS, MENU_LINKS_L2 } from '../constants';

const getKeyValue = <T extends object, U extends keyof T>(obj: T) => (key: U) => obj[key];

export type SideNavProps = {
	isDesktop?: boolean;
};

const SideNav: FC<SideNavProps> = ({ isDesktop }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const menuLinkItemRefs = useRef({});
	const [networkError, setNetworkError] = useState<string | null>(null);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);
	const {
		closeMobileSideNav,
		setSubMenuConfiguration,
		clearSubMenuConfiguration,
	} = SideNavContainer.useContainer();

	const menuLinks = isL2 ? MENU_LINKS_L2 : MENU_LINKS;

	const addOptimismNetwork = async () => {
		try {
			setNetworkError(null);
			if (!window.ethereum || !window.ethereum.isMetaMask) {
				setNetworkError(t('user-menu.error.please-install-metamask'));
			} else await addOptimismNetworkToMetamask({ ethereum: window.ethereum });
		} catch (e) {
			setNetworkError(e.message);
		}
	};

	return (
		<MenuLinks>
			{menuLinks.map(({ i18nLabel, link, subMenu }, i) => {
				const onSetSubMenuConfiguration = () => {
					setSubMenuConfiguration({
						routes: subMenu as any,
						topPosition: (getKeyValue(menuLinkItemRefs.current) as any)(i).getBoundingClientRect()
							.y as number,
					});
				};

				return (
					<MenuLinkItem
						ref={(r) => {
							if (subMenu) {
								menuLinkItemRefs.current = { ...menuLinkItemRefs.current, [i]: r };
							}
						}}
						{...(isDesktop
							? {
									onMouseEnter: () => {
										if (subMenu) {
											onSetSubMenuConfiguration();
										}
									},
									onClick: () => {
										if (!subMenu) {
											router.push(link);
											clearSubMenuConfiguration();
										}
									},
							  }
							: {
									onClick: () => {
										if (subMenu) {
											onSetSubMenuConfiguration();
										} else {
											router.push(link);
											closeMobileSideNav();
											clearSubMenuConfiguration();
										}
									},
							  })}
						key={link}
						data-testid={`sidenav-${link}`}
						isActive={
							subMenu
								? !!subMenu.find(({ subLink }) => subLink === router.asPath)
								: router.asPath === link || (link !== ROUTES.Home && router.asPath.includes(link))
						}
					>
						<div className="link">
							{t(i18nLabel)}
							{subMenu && <Svg src={CaretRightIcon} />}
						</div>
					</MenuLinkItem>
				);
			})}

			{!isDesktop && !isL2 && isWalletConnected ? (
				<MenuLinkItem
					onClick={() => {
						addOptimismNetwork();
						closeMobileSideNav();
					}}
					data-testid="sidenav-switch-to-l2"
					isL2Switcher
				>
					<div className="link">{t('sidenav.switch-to-l2')}</div>
				</MenuLinkItem>
			) : null}
		</MenuLinks>
	);
};

const MenuLinks = styled.div`
	padding-left: 24px;
	position: relative;
`;

const MenuLinkItem = styled.div<{ isActive?: boolean; isL2Switcher?: boolean }>`
	line-height: 40px;
	padding-bottom: 10px;
	position: relative;

	svg {
		margin-left: 6px;
	}

	.link {
		display: flex;
		align-items: center;
		${linkCSS};
		font-family: ${(props) => props.theme.fonts.condensedMedium};
		text-transform: uppercase;
		opacity: 0.4;
		font-size: 14px;
		cursor: pointer;
		color: ${(props) => (props.isL2Switcher ? props.theme.colors.pink : props.theme.colors.white)};
		&:hover {
			opacity: unset;
			color: ${(props) => props.theme.colors.blue};
			svg {
				color: ${(props) => props.theme.colors.blue};
			}
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
	}

	&:after {
		width: 2px;
		height: 40px;
		content: '';
		position: absolute;
		top: 0;
		/* the line needs to outside (so around -3px), however due to overflow issues, it needs to be inside for now */
		right: 0;
		background: ${(props) => props.theme.colors.blue};
		display: none;
		${(props) =>
			props.isActive &&
			css`
				display: block;
			`}
	}
`;

export default SideNav;
