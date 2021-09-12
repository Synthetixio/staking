import axios from 'axios';
import { useQuery, UseQueryOptions } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';

import Connector from 'containers/Connector';
import { yearnSNXVault } from 'contracts';
import {
	walletAddressState,
	isWalletConnectedState,
	networkState,
	isMainnetState,
} from 'store/wallet';

import { LiquidityPoolData } from './types';
import Wei, { wei } from '@synthetixio/wei';

export type YearnVaultData = LiquidityPoolData & {
	apy: Wei;
	tvl: Wei;
	pricePerShare: Wei;
	stakedSNX: Wei;
};

const useYearnSNXVaultQuery = (options?: UseQueryOptions<YearnVaultData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isMainnet = useRecoilValue(isMainnetState);
	const { provider, synthetixjs } = Connector.useContainer();

	return useQuery<YearnVaultData>(
		QUERY_KEYS.LiquidityPools.yearnSNX(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { Synthetix },
			} = synthetixjs!;

			const YearnSNXVault = new ethers.Contract(
				yearnSNXVault.address,
				// @ts-ignore
				yearnSNXVault.abi,
				provider as ethers.providers.Provider
			);

			const [
				yvSNXUserBalance,
				yvSNXPricePerShare,
				allVaultsData,
				snxAllowance,
				snxBalance,
			] = await Promise.all([
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
			enabled: isAppReady && isWalletConnected && isMainnet,
			...options,
		}
	);
};

export default useYearnSNXVaultQuery;
