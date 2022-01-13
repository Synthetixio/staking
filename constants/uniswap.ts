import { Token } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';
import { ethers, providers } from 'ethers';
import { Contract } from 'ethers';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';

const sUSDMainnetToken = new Token(
	1,
	'0x57ab1ec28d129707052df4df418d58a2d46d5f51',
	18,
	'sUSD',
	'Synth sUSD'
);

const SNXDebtMirrorToken = new Token(
	1,
	'0x5f7f94a1dd7b15594d17543beb8b30b111dd464c',
	18,
	'dSNX',
	'SNX Debt Mirror'
);

export async function getSUSDdSNXPool(provider: providers.Provider): Promise<Pool> {
	const poolContract = new Contract(
		'0x9957c4795ab663622db54fc48fda874da59150ff',
		IUniswapV3PoolABI,
		provider || ethers.getDefaultProvider('homestead')
	);
	const [fee, liquidity, slot] = await Promise.all([
		poolContract.fee(),
		poolContract.liquidity(),
		poolContract.slot0(),
	]);
	return new Pool(SNXDebtMirrorToken, sUSDMainnetToken, fee, slot[0], liquidity, slot[1]);
}
