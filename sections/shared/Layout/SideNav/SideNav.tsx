import { FC } from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';

import { linkCSS } from 'styles/common';
import media from 'styles/media';
import CaretRightIcon from 'assets/svg/app/caret-right-small.svg';
import ROUTES from 'constants/routes';

import { isL2State, delegateWalletState } from 'store/wallet';
import { MENU_LINKS, MENU_LINKS_L2, MENU_LINKS_DELEGATE } from '../constants';
import { MobileOrTabletView } from 'components/Media';
import Settings from '../Settings';
import { useAddOptimism } from '../../hooks';

const SideNav: FC = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const isL2 = useRecoilValue(isL2State);
	const delegateWallet = useRecoilValue(delegateWalletState);
	const { showAddOptimism, addOptimismNetwork } = useAddOptimism();

	const menuLinks = delegateWallet ? MENU_LINKS_DELEGATE : isL2 ? MENU_LINKS_L2 : MENU_LINKS;

	return (
		<MenuLinks>
			{menuLinks.map(({ i18nLabel, link, subMenu }, i) => (
				<MenuLinkItem
					onClick={() => router.push(link)}
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
			))}
			{showAddOptimism && (
				<MenuLinkItem onClick={addOptimismNetwork} data-testid="sidenav-switch-to-l2" isL2Switcher>
					<div className="link">{t('sidenav.switch-to-l2')}</div>
				</MenuLinkItem>
			)}
		</MenuLinks>
	);
};

const MenuLinks = styled.div`
	position: relative;
`;

export const MenuLinkItem = styled.div<{ isActive?: boolean; isL2Switcher?: boolean }>`
	line-height: 40px;
	padding-bottom: 10px;
	position: relative;

	svg {
		margin-left: 6px;
	}

	.link {
		padding-left: 24px;
		display: flex;
		align-items: center;
		${linkCSS};
		font-family: ${(props) => props.theme.fonts.condensedMedium};
		text-transform: uppercase;
		opacity: ${(props) => (props.isL2Switcher ? 1 : 0.4)};
		font-size: 14px;
		cursor: pointer;
		color: ${(props) => (props.isL2Switcher ? props.theme.colors.pink : props.theme.colors.white)};
		&:hover {
			opacity: ${(props) => (props.isL2Switcher ? 0.8 : 1)};
			color: ${(props) => (props.isL2Switcher ? props.theme.colors.pink : props.theme.colors.blue)};
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
