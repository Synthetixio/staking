import axios from 'axios';
import { useQuery, UseQueryOptions } from 'react-query';
import { ethers } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';

import Connector from 'containers/Connector';
import { yearnSNXVault } from 'contracts';

import { LiquidityPoolData } from './types';
import Wei, { wei } from '@synthetixio/wei';

export type YearnVaultData = LiquidityPoolData & {
  apy: Wei;
  tvl: Wei;
  pricePerShare: Wei;
  stakedSNX: Wei;
};

const useYearnSNXVaultQuery = (options?: UseQueryOptions<YearnVaultData>) => {
  const {
    provider,
    synthetixjs,
    isAppReady,
    isWalletConnected,
    walletAddress,
    network,
    isMainnet,
  } = Connector.useContainer();

  return useQuery<YearnVaultData>(
    QUERY_KEYS.LiquidityPools.yearnSNX(walletAddress ?? '', network?.id!),
    async () => {
      if (!synthetixjs) throw Error('Expected synthetixjs do be defined');
      const Synthetix = synthetixjs?.contracts.Synthetix;

      const YearnSNXVault = new ethers.Contract(
        yearnSNXVault.address,
        yearnSNXVault.abi,
        provider as ethers.providers.Provider
      );

      const [yvSNXUserBalance, yvSNXPricePerShare, allVaultsData, snxAllowance, snxBalance] =
        await Promise.all([
          YearnSNXVault.balanceOf(walletAddress, { gasLimit: 1e6 }),
          YearnSNXVault.pricePerShare({ gasLimit: 1e5 }),
          axios.get('https://api.yearn.finance/v1/chains/1/vaults/all'),
          Synthetix.allowance(walletAddress, yearnSNXVault.address),
          Synthetix.transferableSynthetix(walletAddress),
        ]);

      const [pricePerShare, allowance, userBalance] = [
        yvSNXPricePerShare,
        snxAllowance,
        snxBalance,
      ].map((data) => wei(data));

      const staked = wei(yvSNXUserBalance);

      const yvSNXVaultData = allVaultsData?.data.find(
        (vault: any) => vault.symbol === 'yvSNX' && vault.type === 'v2'
      );
      const apy = wei(yvSNXVaultData?.apy?.net_apy ?? 0);
      const tvl = wei(yvSNXVaultData?.tvl?.tvl ?? 0);

      return {
        address: yearnSNXVault.address,
        userBalance: userBalance,
        balance: wei(0),
        distribution: wei(0),
        duration: 0,
        periodFinish: Date.now() * 2, // never expires
        rewards: wei(0),
        staked: staked,
        stakedSNX: staked.mul(pricePerShare),
        allowance,
        apy,
        tvl,
        pricePerShare,
      };
    },
    {
      enabled: Boolean(isAppReady && isWalletConnected && isMainnet && synthetixjs),
      ...options,
    }
  );
};

export default useYearnSNXVaultQuery;
