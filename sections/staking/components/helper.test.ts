import { wei } from '@synthetixio/wei';
import {
	getMintAmount,
	getShowSelfLiquidationTab,
	getStakingAmount,
	getTransferableAmountFromBurn,
	getTransferableAmountFromMint,
} from './helper';

describe('staking helpers', () => {
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
	test('getShowSelfLiquidationTab should show', () => {
		const result = getShowSelfLiquidationTab({
			sUSDBalance: wei(10),
			burnAmountToFixCRatio: wei(20), // more than balance
			percentageCurrentCRatio: wei(2.9), // less than target
			percentageTargetCRatio: wei(3),
			isDelegateWallet: false,
		});
		expect(result).toBe(true);
	});
	test('getShowSelfLiquidationTab delegate wallet', () => {
		const result = getShowSelfLiquidationTab({
			sUSDBalance: wei(10),
			burnAmountToFixCRatio: wei(20), // more than balance
			percentageCurrentCRatio: wei(2.9), // less than target
			percentageTargetCRatio: wei(3),
			isDelegateWallet: true,
		});
		expect(result).toBe(false);
	});
	test('getShowSelfLiquidationTab sUSD balance bigger than burnAmountToFixCRatio ', () => {
		const result = getShowSelfLiquidationTab({
			sUSDBalance: wei(30),
			burnAmountToFixCRatio: wei(20), // less than balance so should show
			percentageCurrentCRatio: wei(2.9),
			percentageTargetCRatio: wei(3),
			isDelegateWallet: false,
		});
		expect(result).toBe(false);
	});
	test('getShowSelfLiquidationTab percentageCurrentCRatio is 0', () => {
		const result = getShowSelfLiquidationTab({
			sUSDBalance: wei(10),
			burnAmountToFixCRatio: wei(20),
			percentageCurrentCRatio: wei(0),
			percentageTargetCRatio: wei(3),
			isDelegateWallet: false,
		});
		expect(result).toBe(false);
	});
	test('getShowSelfLiquidationTab percentageCurrentCRatio higher than percentageTargetCRatio', () => {
		const result = getShowSelfLiquidationTab({
			sUSDBalance: wei(10),
			burnAmountToFixCRatio: wei(20),
			percentageCurrentCRatio: wei(3.1),
			percentageTargetCRatio: wei(3),
			isDelegateWallet: false,
		});
		expect(result).toBe(false);
	});
});
