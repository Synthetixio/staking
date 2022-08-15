import { SubMenuLink } from 'sections/shared/Layout/constants';

type MobileNavState = {
  isMobileNavOpen: boolean;
  isMobileSubNavOpen: boolean;
  activeMobileSubNav: SubMenuLink[] | null;
};

export const initialState: MobileNavState = {
  isMobileNavOpen: false,
  isMobileSubNavOpen: false,
  activeMobileSubNav: null,
};

export type Actions =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'set_sub'; subMenu: SubMenuLink[] }
  | { type: 'clear_sub' };

export function reducer(state: MobileNavState, action: Actions) {
  switch (action.type) {
    case 'open':
      return { ...state, isMobileNavOpen: true };
    case 'close':
      return {
        ...state,
        isMobileNavOpen: false,
        isMobileSubNavOpen: false,
        activeMobileSubNav: null,
      };
    case 'set_sub':
      return {
        ...state,
        isMobileSubNavOpen: true,
        activeMobileSubNav: action.subMenu,
      };
    case 'clear_sub':
      return {
        ...state,
        isMobileSubNavOpen: false,
        activeMobileSubNav: null,
      };
    default:
      return { ...state };
  }
}
