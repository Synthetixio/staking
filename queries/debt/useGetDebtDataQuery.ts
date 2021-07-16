import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import {
	isWalletConnectedState,
	networkState,
	walletAddressState,
	delegateWalletState,
} from 'store/wallet';
import { appReadyState } from 'store/app';
import { toBigNumber } from 'utils/formatters/number';

type WalletDebtData = {
	targetCRatio: BigNumber;
	currentCRatio: BigNumber;
	transferable: BigNumber;
	debtBalance: BigNumber;
	collateral: BigNumber;
	issuableSynths: BigNumber;
	balance: BigNumber;
	totalSupply: BigNumber;
	targetThreshold: BigNumber;
};

const useGetDebtDataQuery = (options?: QueryConfig<WalletDebtData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const delegateWallet = useRecoilValue(delegateWalletState);

	const wallet = delegateWallet?.address ?? walletAddress;

	return useQuery<WalletDebtData>(
		QUERY_KEYS.Debt.WalletDebtData(wallet ?? '', network?.id!),
		async () => {
			const {
				contracts: { SystemSettings, Synthetix },
				utils,
			} = synthetix.js!;
			const sUSDBytes = utils.formatBytes32String('sUSD');
			const result = await Promise.all([
				SystemSettings.issuanceRatio(),
				Synthetix.collateralisationRatio(wallet),
				Synthetix.transferableSynthetix(wallet),
				Synthetix.debtBalanceOf(wallet, sUSDBytes),
				Synthetix.collateral(wallet),
				Synthetix.maxIssuableSynths(wallet),
				Synthetix.balanceOf(wallet),
				Synthetix.totalSupply(),
				SystemSettings.targetThreshold(),
			]);
			const [
				targetCRatio,
				currentCRatio,
				transferable,
				debtBalance,
				collateral,
				issuableSynths,
				balance,
				totalSupply,
				targetThreshold,
			] = result.map((item) => toBigNumber(utils.formatEther(item)));
			return {
				targetCRatio,
				currentCRatio,
				transferable,
				debtBalance,
				collateral,
				issuableSynths,
				balance,
				totalSupply,
				targetThreshold,
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useGetDebtDataQuery;
