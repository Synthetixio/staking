import { BigNumber } from 'ethers';
import { atom } from 'recoil';
import { getDebtKey } from 'store/utils';

export enum DebtPanelType {
	OVERVIEW = 'overview',
	MANAGE = 'manage',
}

export const dSNXBalance = atom<BigNumber>({
	key: getDebtKey('dSNXBalance'),
	default: BigNumber.from(0),
});
