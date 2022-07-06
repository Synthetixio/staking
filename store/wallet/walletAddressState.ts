import { atom } from 'recoil';
import { getWalletKey } from 'store/utils';

export const walletAddressState = atom<string | null>({
	key: getWalletKey('walletAddress'),
	default: null,
});
