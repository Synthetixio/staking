import { Contract } from 'ethers';
import { abi as erc20ABI } from 'contracts/erc20';
import { abi as dHedgePoolLogicABI } from 'contracts/dHedgePoolLogic';

export const dHedgeAPIUrl = 'https://api-v2.dhedge.org/graphql';
export const dSNXContractMainnet = new Contract(
  '0x5f7F94a1dd7b15594d17543BEB8B30b111DD464c',
  erc20ABI
);
export const dSNXContractOptimism = new Contract(
  '0x59babc14dd73761e38e5bda171b2298dc14da92d',
  erc20ABI
);

export const dSNXPoolAddressMainnet = '0x65bb99e80a863e0e27ee6d09c794ed8c0be47186';
export const dSNXPoolAddressOptimism = '0x59babc14dd73761e38e5bda171b2298dc14da92d';
export const dSNXPoolContractOptimism = new Contract(dSNXPoolAddressOptimism, dHedgePoolLogicABI);
