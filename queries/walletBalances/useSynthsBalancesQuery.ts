import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import { orderBy } from 'lodash';
import BigNumber from 'bignumber.js';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';

import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';
import { appReadyState } from 'store/app';

import { toBigNumber } from 'utils/formatters/number';
import { CryptoBalance } from './types';

export type SynthBalancesMap = Record<CurrencyKey, CryptoBalance>;

type SynthBalancesTuple = [CurrencyKey[], number[], number[]];

export type Balances = {
	balancesMap: SynthBalancesMap;
	balances: CryptoBalance[];
	totalUSDBalance: BigNumber;
};

const useSynthsBalancesQuery = (options?: QueryConfig<Balances>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<Balances>(
		QUERY_KEYS.WalletBalances.Synths(
			'0x5b97680e165b4dbf5c45f4ff4241e85f418c66c2' ?? '',
			network?.id!
		),
		async () => {
			const balancesMap: SynthBalancesMap = {};
			const [
				currencyKeys,
				synthsBalances,
				synthsUSDBalances,
			] = (await synthetix.js?.contracts.SynthUtil!.synthsBalances(
				walletAddress
			)) as SynthBalancesTuple;

			let totalUSDBalance = toBigNumber(0);

			currencyKeys.forEach((currencyKey: string, idx: number) => {
				const balance = toBigNumber(ethers.utils.formatEther(synthsBalances[idx]));

				// discard empty balances
				if (balance.gt(0)) {
					const synthName = ethers.utils.parseBytes32String(currencyKey) as CurrencyKey;
					const usdBalance = toBigNumber(ethers.utils.formatEther(synthsUSDBalances[idx]));

					balancesMap[synthName] = {
						currencyKey: synthName,
						balance,
						usdBalance,
					};

					totalUSDBalance = totalUSDBalance.plus(usdBalance);
				}
			});

			return {
				balancesMap,
				balances: orderBy(
					Object.values(balancesMap),
					(balance) => balance.usdBalance.toNumber(),
					'desc'
				),
				totalUSDBalance,
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useSynthsBalancesQuery;
