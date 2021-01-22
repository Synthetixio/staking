import { atom } from 'recoil';

import { getChainKey } from '../utils';

export const isLayerOneState = atom<boolean>({
	key: getChainKey('isLayerOneState'),
	default: false,
});
