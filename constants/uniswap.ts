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
	// TODO @MF update address when known
	'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
	18,
	'dSNX',
	'SNX Debt Mirror'
);

export async function getSUSDdSNXPool(provider: providers.Provider): Promise<Pool> {
	const poolContract = new Contract(
		'0x60594a405d53811d3bc4766596efd80fd545a270',
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
