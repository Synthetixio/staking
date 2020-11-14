import { useQuery, QueryConfig } from 'react-query';
import { SynthetixJS } from '@synthetixio/js';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';

import { WalletDebtData } from './types';

const useGetDebtDataQuery = (options?: QueryConfig<WalletDebtData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<WalletDebtData>(
		QUERY_KEYS.Debt.WalletDebtData(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { SystemSettings, Synthetix, SynthetixState },
				utils,
			} = synthetix.js as SynthetixJS;
			const IssuanceRatioContract = network?.id === 5 ? SystemSettings : SynthetixState;
			const sUSDBytes = utils.formatBytes32String('sUSD');
			const result = await Promise.all([
				IssuanceRatioContract.issuanceRatio(),
				Synthetix.collateralisationRatio(walletAddress),
				Synthetix.transferableSynthetix(walletAddress),
				Synthetix.debtBalanceOf(walletAddress, sUSDBytes),
				Synthetix.collateral(walletAddress),
				Synthetix.maxIssuableSynths(walletAddress),
			]);
			const [
				targetCRatio,
				currentCRatio,
				transferable,
				debtBalance,
				collateral,
				maxIssuableSynths,
			] = result.map((item) => Number(utils.formatEther(item)));
			const issuableSynths = Math.max(0, maxIssuableSynths - debtBalance);
			return {
				targetCRatio,
				currentCRatio,
				transferable,
				debtBalance,
				collateral,
				issuableSynths,
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useGetDebtDataQuery;
