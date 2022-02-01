import { Token } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';
import { providers, BigNumber, Contract } from 'ethers';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { abi as UniswapRouterV3 } from 'contracts/uniswapRouterV3';
import { abi as erc20ABI } from 'contracts/erc20';
import { abi as QuoterABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';

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

export const routerContract = new Contract(
	'0xE592427A0AEce92De3Edee1F18E0157C05861564',
	UniswapRouterV3
);

export const sUSDContract = new Contract('0x57ab1ec28d129707052df4df418d58a2d46d5f51', erc20ABI);

export const dSNXContract = new Contract('0x5f7F94a1dd7b15594d17543BEB8B30b111DD464c', erc20ABI);

export const quoterContract = new Contract('0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6', QuoterABI);

const poolContract = new Contract('0x9957c4795ab663622db54fc48fda874da59150ff', IUniswapV3PoolABI);

interface State {
	liquidity: BigNumber;
	sqrtPriceX96: BigNumber;
	tick: number;
	observationIndex: number;
	observationCardinality: number;
	observationCardinalityNext: number;
	feeProtocol: number;
	unlocked: boolean;
}

export interface Immutables {
	factory: string;
	token0: string;
	token1: string;
	fee: number;
	tickSpacing: number;
	maxLiquidityPerTick: BigNumber;
}

export async function getSUSDdSNXPool(
	provider: providers.Provider
): Promise<[Pool, (amountIn: BigNumber) => Promise<BigNumber>]> {
	async function getPoolImmutables() {
		const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] = await Promise.all([
			poolContract.connect(provider).factory(),
			poolContract.connect(provider).token0(),
			poolContract.connect(provider).token1(),
			poolContract.connect(provider).fee(),
			poolContract.connect(provider).tickSpacing(),
			poolContract.connect(provider).maxLiquidityPerTick(),
		]);

		const immutables: Immutables = {
			factory,
			token0,
			token1,
			fee,
			tickSpacing,
			maxLiquidityPerTick,
		};
		return immutables;
	}

	async function getPoolState() {
		const [liquidity, slot] = await Promise.all([
			poolContract.connect(provider).liquidity(),
			poolContract.connect(provider).slot0(),
		]);

		const PoolState: State = {
			liquidity,
			sqrtPriceX96: slot[0],
			tick: slot[1],
			observationIndex: slot[2],
			observationCardinality: slot[3],
			observationCardinalityNext: slot[4],
			feeProtocol: slot[5],
			unlocked: slot[6],
		};

		return PoolState;
	}
	const [immutables, state] = await Promise.all([getPoolImmutables(), getPoolState()]);
	const amountOut = async (amountIn: BigNumber) =>
		quoterContract
			.connect(provider)
			.callStatic.quoteExactInputSingle(
				immutables.token0,
				immutables.token1,
				immutables.fee,
				amountIn,
				0
			);
	return [
		new Pool(
			sUSDMainnetToken,
			SNXDebtMirrorToken,
			immutables.fee,
			state.sqrtPriceX96.toString(),
			state.liquidity.toString(),
			state.tick
		),
		amountOut,
	];
}
