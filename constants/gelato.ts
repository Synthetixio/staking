import { Contract } from 'ethers';
import { ERC20Abi } from '@synthetixio/queries';

export const WETHSNXLPTokenContract = new Contract(
  '0x83bEeFB4cA39af649D03969B442c0E9F4E1732D8',
  ERC20Abi
);
export const SUSDDAILPTokenContract = new Contract(
  '0x88ccDBbA89E073C5DC08B9c84dfc1fDc152c0dAc',
  ERC20Abi
);

export const gelatoGraphURL =
  'https://api.thegraph.com/subgraphs/name/gelatodigital/g-uni-optimism';
export const UNISWAP_HELPERS_ADDRESS = '0x7D4a0231377a6CA320FF5f084b633a2e6B688107';
