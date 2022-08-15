import { useReducer, useState } from 'react';
import { createContainer } from 'unstated-next';

import { reducer, initialState } from './reducer';

export default createContainer(Container);

function Container() {
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [state, dispatch] = useReducer(reducer, initialState);

  const { isMobileNavOpen, isMobileSubNavOpen, activeMobileSubNav } = state;

  return {
    networkError,
    setNetworkError,
    isMobileNavOpen,
    isMobileSubNavOpen,
    activeMobileSubNav,
    dispatch,
  };
}
