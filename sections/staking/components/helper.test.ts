import { wei } from '@synthetixio/wei';
import {
	getMintAmount,
	getStakingAmount,
	getTransferableAmountFromBurn,
	getTransferableAmountFromMint,
} from './helper';

describe('stake helpers', () => {
	test('getMintAmount', () => {
		const targetCRatio = wei(0.25);
		const stakeAmount = 100;
		const SNXPrice = wei(10);
		const result = getMintAmount(targetCRatio, stakeAmount, SNXPrice);
		expect(result.toString(0)).toBe('250');
	});
	test('getStakingAmount', () => {
		const targetCRatio = wei(0.25);
		const mintAmount = 100;
		const SNXPrice = wei(10);
		const result = getStakingAmount(targetCRatio, mintAmount, SNXPrice);
		expect(result.toString(0)).toBe('40');
	});
	test('getTransferableAmountFromMint', () => {
		const balance = wei(100);
		const stakedValue = wei(50);
		const result = getTransferableAmountFromMint(balance, stakedValue);
		expect(result.toString(0)).toBe('50');
	});
	test('getTransferableAmountFromBurn', () => {
		const amountToBurn = 100;
		const debtEscrowBalance = wei(50);
		const targetCRatio = wei(0.25);
		const SNXPrice = wei(10);
		const transferable = wei(50);
		const result = getTransferableAmountFromBurn(
			amountToBurn,
			debtEscrowBalance,
			targetCRatio,
			SNXPrice,
			transferable
		);
		expect(result.toString(0)).toBe('70');
	});
});
