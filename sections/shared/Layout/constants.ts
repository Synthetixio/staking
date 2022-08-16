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
  {
    i18nLabel: 'sidenav.loans',
    link: ROUTES.Loans.Home,
  },
  {
    i18nLabel: 'sidenav.bridge',
    link: ROUTES.Bridge.Home,
  },
  {
    i18nLabel: 'sidenav.gov',
    link: ROUTES.Gov.Home,
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
        i18nLabel: 'sidenav.migrate-escrow',
        subLink: ROUTES.EscrowMigrate.Home,
      },
      {
        i18nLabel: 'sidenav.synths',
        subLink: ROUTES.Synths.Home,
      },
      {
        i18nLabel: 'sidenav.history',
        subLink: ROUTES.History.Home,
      },
      {
        i18nLabel: 'sidenav.delegate',
        subLink: ROUTES.Delegate.Home,
      },
      {
        i18nLabel: 'sidenav.merge-accounts',
        subLink: ROUTES.MergeAccounts.Home,
      },
    ],
  },
];

export const MENU_LINKS_L2: MenuLinks = [
  {
    i18nLabel: 'sidenav.dashboard',
    link: ROUTES.Home,
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
  {
    i18nLabel: 'sidenav.loans',
    link: ROUTES.Loans.Home,
  },
  {
    i18nLabel: 'sidenav.gov',
    link: ROUTES.Gov.Home,
  },
  {
    i18nLabel: 'sidenav.bridge',
    link: ROUTES.Bridge.Home,
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
        i18nLabel: 'sidenav.delegate',
        subLink: ROUTES.Delegate.Home,
      },
      {
        i18nLabel: 'sidenav.merge-accounts',
        subLink: ROUTES.MergeAccounts.Home,
      },
    ],
  },
];

export const MENU_LINKS_DELEGATE: MenuLinks = [
  {
    i18nLabel: 'sidenav.dashboard',
    link: ROUTES.Home,
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
    ],
  },
];
