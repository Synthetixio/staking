import { Contract } from 'ethers';
import { abi as erc20ABI } from 'contracts/erc20';
import { abi as dHedgePoolLogicABI } from 'contracts/dHedgePoolLogic';
import { wei } from '@synthetixio/wei';

export const dHedgeAPIUrl = 'https://api-v2.dhedge.org/graphql';
export const dSNXContractMainnet = new Contract(
  '0x5f7F94a1dd7b15594d17543BEB8B30b111DD464c',
  erc20ABI
);

export const dSNXPoolAddressMainnet = '0x65bb99e80a863e0e27ee6d09c794ed8c0be47186';
export const dSNXPoolAddressOptimism = '0x59babc14dd73761e38e5bda171b2298dc14da92d';
export const dSNXPoolContractOptimism = new Contract(dSNXPoolAddressOptimism, dHedgePoolLogicABI);
export const dSNXWrapperSwapperContractOptimism = new Contract(
  '0xf8C62BD5f2fEf9E1a329c197F32E77AD6866B022',
  [
    'function withdrawSUSD(address pool, uint256 fundTokenAmount,address intermediateAsset,uint256 expectedAmountSUSD) external',
  ]
);
// this slippage is just use for estimation, the actual slippage might differ
export const SLIPPAGE = wei(0.01);
