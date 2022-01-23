import { Contract } from 'ethers';
import ERC20ABI from '@synthetixio/queries/build/node/src/abis/ERC20.json';

export const WETHSNXLPTokenContract = new Contract(
	'0x83bEeFB4cA39af649D03969B442c0E9F4E1732D8',
	ERC20ABI
);
export const SUSDDAILPTokenContract = new Contract(
	'0x88ccDBbA89E073C5DC08B9c84dfc1fDc152c0dAc',
	ERC20ABI
);
