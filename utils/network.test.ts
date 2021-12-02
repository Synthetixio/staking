import { BigNumber } from 'ethers';
import { getGweiGasPriceOrMaxFee, getTransactionPrice } from './network';
import { GWEI_DECIMALS, GWEI_UNIT } from './infura';
import { wei } from '@synthetixio/wei';

describe('network', () => {
	test('getGweiGasPriceOrMaxFee', () => {
		const l2 = getGweiGasPriceOrMaxFee({ gasPrice: BigNumber.from(200) });
		expect(l2.toNumber()).toEqual(200 / GWEI_UNIT);
		const l1 = getGweiGasPriceOrMaxFee({ maxFeePerGas: BigNumber.from(100) });
		expect(l1.toNumber()).toEqual(100 / GWEI_UNIT);
	});
	test('getTransactionPrice OVM', () => {
		const gasPrice = { gasPrice: BigNumber.from(1000000) };
		const gasLimit = wei(678031, GWEI_DECIMALS).toBN();
		const ethPrice = wei(4500);
		const layerOneFees = wei(0.001);
		const result = getTransactionPrice(gasPrice, gasLimit, ethPrice, layerOneFees);

		expect(result?.toString(1)).toBe('4.5');
	});
	test('getTransactionPrice EIP1559', () => {
		const gasPrice = { maxFeePerGas: BigNumber.from(204715396048) };
		const gasLimit = wei(549278, GWEI_DECIMALS).toBN();
		const ethPrice = wei(4500);
		const result = getTransactionPrice(gasPrice, gasLimit, ethPrice, null);

		expect(result?.toString(2)).toBe('506.01');
	});
});
