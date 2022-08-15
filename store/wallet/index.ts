import { NetworkId, NetworkName } from '@synthetixio/contracts-interface';
import { GasSpeed } from '@synthetixio/queries';
import { atom } from 'recoil';

import { getWalletKey } from '../utils';

import { DelegationWallet } from '@synthetixio/queries';

export type Network = {
  id: NetworkId | number;
  name: NetworkName | string;
  useOvm: boolean;
};

export const walletAddressState = atom<string | null>({
  key: getWalletKey('walletAddress'),
  default: null,
});

export const ensNameState = atom<string | null>({
  key: getWalletKey('ensName'),
  default: null,
});

export const walletWatchedState = atom<string | null>({
  key: getWalletKey('walletWatched'),
  default: null,
});

export const gasSpeedState = atom<GasSpeed>({
  key: getWalletKey('gasSpeed'),
  default: 'fast',
});

export const isEOAWalletState = atom<boolean>({
  key: getWalletKey('isEOAWallet'),
  default: false,
});

export const delegateWalletState = atom<DelegationWallet | null>({
  key: getWalletKey('delegateWallet'),
  default: null,
});
