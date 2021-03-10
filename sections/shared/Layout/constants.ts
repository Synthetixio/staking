import ROUTES from 'constants/routes';

export type SubMenuLink = {
	i18nLabel: string;
	subLink: string;
};

export type MenuLink = {
	i18nLabel: string;
	link: string;
	subMenu?: SubMenuLink[];
};

export type MenuLinks = MenuLink[];

export const MENU_LINKS: MenuLinks = [
	{
		i18nLabel: 'sidenav.dashboard',
		link: ROUTES.Home,
	},
	{
		i18nLabel: 'sidenav.loans',
		link: ROUTES.Loans.Home,
	},
	{
		i18nLabel: 'sidenav.staking',
		link: ROUTES.Staking.Home,
		subMenu: [
			{
				i18nLabel: 'sidenav.mint-and-burn',
				subLink: ROUTES.Staking.Home,
			},
			{
				i18nLabel: 'sidenav.earn',
				subLink: ROUTES.Earn.Home,
			},
			{
				i18nLabel: 'sidenav.debt',
				subLink: ROUTES.Debt.Home,
			},
		],
	},
	// {
	// 	i18nLabel: 'sidenav.loans',
	// 	link: ROUTES.Loans.Home,
	// },
	{
		i18nLabel: 'sidenav.gov',
		link: ROUTES.Gov.Home,
	},
	{
		i18nLabel: 'sidenav.l2',
		link: ROUTES.L2.Home,
	},
	{
		i18nLabel: 'sidenav.wallet',
		link: ROUTES.Escrow.Home,
		subMenu: [
			{
				i18nLabel: 'sidenav.escrow',
				subLink: ROUTES.Escrow.Home,
			},
			{
				i18nLabel: 'sidenav.synths',
				subLink: ROUTES.Synths.Home,
			},
			{
				i18nLabel: 'sidenav.history',
				subLink: ROUTES.History.Home,
			},
		],
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
