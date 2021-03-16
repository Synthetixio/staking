import { atom } from 'recoil';

import { getStakingKey } from '../utils';

export enum StakingPanelType {
	BURN = 'burn',
	MINT = 'mint',
	CLEAR = 'clear',
}

export enum MintActionType {
	MAX = 'max',
	CUSTOM = 'custom',
}

export enum BurnActionType {
	MAX = 'max',
	TARGET = 'target',
	CUSTOM = 'custom',
	CLEAR = 'clear',
}

export const amountToMintState = atom<string>({
	key: getStakingKey('amountToMint'),
	default: '',
});

export const amountToBurnState = atom<string>({
	key: getStakingKey('amountToBurn'),
	default: '',
});

export const mintTypeState = atom<MintActionType | null>({
	key: getStakingKey('mintType'),
	default: null,
});

export const burnTypeState = atom<BurnActionType | null>({
	key: getStakingKey('burnType'),
	default: null,
});
