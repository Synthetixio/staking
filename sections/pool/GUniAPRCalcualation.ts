import axios from 'axios';
import { ethers, BigNumber, providers, Contract } from 'ethers';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { GELATO_POOL_ABI } from './useGetUniswapStakingRewardsAPY';
import { gelatoGraphURL, UNISWAP_HELPERS_ADDRESS } from 'constants/gelato';

const X96 = BigNumber.from(2).pow(BigNumber.from(96));
const BLOCKS_PER_YEAR = 537542;

interface GUNIPoolToken {
  address: string;
  name: string;
  symbol: string;
}
interface GUNIPoolGraphQLResponse {
  id: string;
  uniswapPool: string;
  token0: GUNIPoolToken;
  token1: GUNIPoolToken;
  lowerTick: string;
  upperTick: string;
  supplySnapshots: {
    id: string;
    block: string;
    reserves0: string;
    reserves1: string;
  }[];
  feeSnapshots: {
    id?: string;
    block: string;
    feesEarned0: string;
    feesEarned1: string;
  }[];
}

const computeAverageReserves = (
  snapshots: GUNIPoolGraphQLResponse['supplySnapshots'],
  sqrtPriceX96: BigNumber,
  firstBlock: number
) => {
  let cumulativeBlocks = BigNumber.from(0);
  let cumulativeReserves = BigNumber.from(0);
  const priceX96X96 = sqrtPriceX96.mul(sqrtPriceX96);
  for (let i = 0; i < snapshots.length; i++) {
    if (Number(snapshots[i].block) > firstBlock) {
      const reserves0 = BigNumber.from(snapshots[i].reserves0);
      const reserves1 = BigNumber.from(snapshots[i].reserves1);
      const reserves0As1X96 = reserves0.mul(priceX96X96).div(X96);
      const reserves0As1 = reserves0As1X96.div(X96);
      const reserves = reserves1.add(reserves0As1);
      let blockDifferential: BigNumber;
      if (i === 0) {
        blockDifferential = BigNumber.from(snapshots[i].block).sub(
          BigNumber.from(firstBlock.toString())
        );
      } else {
        blockDifferential = BigNumber.from(snapshots[i].block).sub(
          BigNumber.from(snapshots[i - 1].block)
        );
      }
      if (blockDifferential.lt(ethers.constants.Zero)) {
        blockDifferential = ethers.constants.Zero;
      }
      cumulativeReserves = cumulativeReserves.add(reserves.mul(blockDifferential));
      cumulativeBlocks = cumulativeBlocks.add(blockDifferential);
    }
  }
  return cumulativeReserves.div(cumulativeBlocks);
};

const computeTotalFeesEarned = (
  snapshots: GUNIPoolGraphQLResponse['feeSnapshots'],
  sqrtPriceX96: BigNumber
): BigNumber => {
  let feesEarned0 = BigNumber.from(0);
  let feesEarned1 = BigNumber.from(0);
  for (let i = 0; i < snapshots.length; i++) {
    feesEarned0 = feesEarned0.add(BigNumber.from(snapshots[i].feesEarned0));
    feesEarned1 = feesEarned1.add(BigNumber.from(snapshots[i].feesEarned1));
  }
  const priceX96X96 = sqrtPriceX96.mul(sqrtPriceX96);
  const fees0As1X96 = feesEarned0.mul(priceX96X96).div(X96);
  const fees0As1 = fees0As1X96.div(X96);
  return feesEarned1.add(fees0As1);
};

const getAPR = async (
  poolData: GUNIPoolGraphQLResponse,
  guniPoolContract: Contract,
  uniswapPoolContract: Contract,
  helpersContract: Contract,
  balance0: BigNumber,
  balance1: BigNumber
): Promise<number> => {
  if (poolData.supplySnapshots.length === 0) {
    return 0;
  }
  if (poolData.feeSnapshots.length === 0) {
    return 0;
  }
  const snapshots = [...poolData.feeSnapshots].sort((a: any, b: any) =>
    a.block > b.block ? 1 : -1
  );
  const supplySnaps = [...poolData.supplySnapshots].sort((a: any, b: any) =>
    a.block > b.block ? 1 : -1
  );
  const currentBlock = (await helpersContract.provider.getBlock('latest')).number;
  const sqrtPriceX96 = (await uniswapPoolContract.slot0()).sqrtPriceX96;
  const { amount0Current, amount1Current } = await guniPoolContract.getUnderlyingBalances();
  const positionId = await guniPoolContract.getPositionID();
  const { _liquidity } = await uniswapPoolContract.positions(positionId);
  const { amount0, amount1 } = await helpersContract.getAmountsForLiquidity(
    sqrtPriceX96,
    poolData.lowerTick,
    poolData.upperTick,
    _liquidity
  );
  let feesEarned0: BigNumber = amount0Current.sub(amount0).sub(balance0);
  let feesEarned1: BigNumber = amount1Current.sub(amount1).sub(balance1);
  if (feesEarned0.lt(ethers.constants.Zero)) {
    feesEarned0 = ethers.constants.Zero;
  }
  if (feesEarned1.lt(ethers.constants.Zero)) {
    feesEarned1 = ethers.constants.Zero;
  }
  snapshots.push({
    block: currentBlock.toString(),
    feesEarned0: feesEarned0.toString(),
    feesEarned1: feesEarned1.toString(),
  });
  const firstBlock = currentBlock - 40320 * 4;
  const totalBlocks = currentBlock - firstBlock;
  const totalFeeValue = computeTotalFeesEarned(snapshots, sqrtPriceX96);
  const averageReserves = computeAverageReserves(supplySnaps, sqrtPriceX96, firstBlock);
  let averagePrincipal = averageReserves.sub(totalFeeValue);
  if (averagePrincipal.lt(ethers.constants.Zero)) {
    averagePrincipal = averageReserves;
  }

  const apr =
    (Number(ethers.utils.formatEther(totalFeeValue)) * BLOCKS_PER_YEAR) /
    (Number(ethers.utils.formatEther(averagePrincipal)) * totalBlocks);
  return apr;
};

export const fetchAPRs = async (provider: providers.Web3Provider, gUniPoolAddress: string) => {
  const { data } = await axios({
    url: gelatoGraphURL,
    method: 'POST',
    data: {
      query: `{
                pools(where:{address: "${gUniPoolAddress}"}) {
                    id
          uniswapPool
                    token0 {
                        address
                        name
                        symbol
                      }
                      token1 { 
                        address
                        name
                        symbol
                      }
                    lowerTick
                    upperTick
                    supplySnapshots {
                      id
                      block
                      reserves0
                      reserves1
                    }
                    feeSnapshots {
                      id
                      block
                      feesEarned0
                      feesEarned1
                    }
                  }
                }`,
    },
  });

  const [pool]: [GUNIPoolGraphQLResponse] = data.data.pools;

  const helpersContract = new ethers.Contract(
    UNISWAP_HELPERS_ADDRESS,
    [
      'function getAmountsForLiquidity(uint160,int24,int24,uint128) external pure returns(uint256 amount0,uint256 amount1)',
    ],
    provider
  );
  const guniPoolContract = new ethers.Contract(
    ethers.utils.getAddress(pool.id),
    GELATO_POOL_ABI,
    provider
  );
  const uniswapPoolContract = new ethers.Contract(
    ethers.utils.getAddress(pool.uniswapPool),
    IUniswapV3PoolABI,
    provider
  );
  const token0 = new ethers.Contract(
    ethers.utils.getAddress(pool.token0.address),
    ['function balanceOf(address) external view returns (uint256)'],
    provider
  );
  const token1 = new ethers.Contract(
    ethers.utils.getAddress(pool.token1.address),
    ['function balanceOf(address) external view returns (uint256)'],
    provider
  );
  const balance0 = await token0.balanceOf(ethers.utils.getAddress(pool.id));
  const balance1 = await token1.balanceOf(ethers.utils.getAddress(pool.id));
  return await getAPR(
    pool,
    guniPoolContract,
    uniswapPoolContract,
    helpersContract,
    balance0,
    balance1
  );
};
