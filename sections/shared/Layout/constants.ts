import ROUTES from 'constants/routes';

export type MenuLink = {
	i18nLabel: string;
	link: string;
};

export type MenuLinks = MenuLink[];

export const MENU_LINKS: MenuLinks = [
	{
		i18nLabel: 'sidenav.dashboard',
		link: ROUTES.Dashboard.Home,
	},
	{
		i18nLabel: 'sidenav.staking',
		link: ROUTES.Staking.Home,
	},
	{
		i18nLabel: 'sidenav.earn',
		link: ROUTES.Earn.Home,
	},
	{
		i18nLabel: 'sidenav.escrow',
		link: ROUTES.Escrow.Home,
	},
	{
		i18nLabel: 'sidenav.history',
		link: ROUTES.History.Home,
	},
	{
		i18nLabel: 'sidenav.synths',
		link: ROUTES.Synths.Home,
	},
];

export const MENU_LINKS_WALLET_CONNECTED: MenuLinks = [];
