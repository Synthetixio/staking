import ROUTES from 'constants/routes';

export type MenuLink = {
	i18nLabel: string;
	link: string;
};

export type MenuLinks = MenuLink[];

export const MENU_LINKS: MenuLinks = [
	{
		i18nLabel: 'sidenav.dashboard',
		link: ROUTES.Home,
	},
	{
		i18nLabel: 'sidenav.loans',
		link: ROUTES.Loans,
	},
	{
		i18nLabel: 'sidenav.staking',
		link: ROUTES.Staking.Home,
	},
	{
		i18nLabel: 'sidenav.debt',
		link: ROUTES.Debt.Home,
	},
	{
		i18nLabel: 'sidenav.earn',
		link: ROUTES.Earn.Home,
	},
	{
		i18nLabel: 'sidenav.synths',
		link: ROUTES.Synths.Home,
	},
	{
		i18nLabel: 'sidenav.history',
		link: ROUTES.History.Home,
	},
	{
		i18nLabel: 'sidenav.escrow',
		link: ROUTES.Escrow.Home,
	},
	{
		i18nLabel: 'sidenav.l2',
		link: ROUTES.L2.Home,
	},
];

export const MIGRATE_MENU_LINKS: MenuLinks = [
	{
		i18nLabel: 'sidenav.dashboard',
		link: ROUTES.Home,
	},
	{
		i18nLabel: 'sidenav.escrow',
		link: ROUTES.Escrow.Home,
	},
];

export const MENU_LINKS_WALLET_CONNECTED: MenuLinks = [];
