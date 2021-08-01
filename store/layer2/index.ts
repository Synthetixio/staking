import { atom } from 'recoil';
import { getLayer2Key } from '../utils';

export const amountToDepositState = atom<string>({
	key: getLayer2Key('amountToDeposit'),
	default: '',
});
