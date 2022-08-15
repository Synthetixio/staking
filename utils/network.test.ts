import { BigNumber } from 'ethers';
import { getTotalGasPrice, getTransactionPrice } from './network';
import { GWEI_DECIMALS, GWEI_UNIT } from './infura';
import { wei } from '@synthetixio/wei';

describe('network', () => {
  test('getGweiGasPriceOrMaxFee', () => {
    const l2 = getTotalGasPrice({ gasPrice: BigNumber.from(200) });
    expect(l2.toNumber()).toEqual(200 / GWEI_UNIT);
    const l1 = getTotalGasPrice({
      maxFeePerGas: BigNumber.from(100), // Max should be ignored when calculating price
      baseFeePerGas: BigNumber.from(50),
      maxPriorityFeePerGas: BigNumber.from(4),
    });
    expect(l1.toNumber()).toEqual(54 / GWEI_UNIT);
  });
  test('getTransactionPrice OVM', () => {
    const gasPrice = { gasPrice: wei(0.001 / GWEI_UNIT, GWEI_DECIMALS).toBN() };
    const gasLimit = wei(678031, GWEI_DECIMALS).toBN();
    const ethPrice = wei(4500);
    const layerOneFees = wei(0.001);
    const result = getTransactionPrice(gasPrice, gasLimit, ethPrice, layerOneFees);

    expect(result?.toString(1)).toBe('4.5');
  });
  test('getTransactionPrice EIP1559', () => {
    const gasPrice = {
      maxFeePerGas: wei(204 / GWEI_UNIT, GWEI_DECIMALS).toBN(), // Max should be ignored when calculating price
      baseFeePerGas: wei(200 / GWEI_UNIT, GWEI_DECIMALS).toBN(),
      maxPriorityFeePerGas: wei(4 / GWEI_UNIT, GWEI_DECIMALS).toBN(),
    };
    const gasLimit = wei(549278, GWEI_DECIMALS).toBN();
    const ethPrice = wei(4500);
    const result = getTransactionPrice(gasPrice, gasLimit, ethPrice, null);

    expect(result?.toString(2)).toBe('504.24');
  });
});
