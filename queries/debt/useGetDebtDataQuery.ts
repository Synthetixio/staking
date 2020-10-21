import { useQuery, QueryConfig } from 'react-query';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';

export type WalletDebtData = any;

const useGetDebtDataQuery = (options?: QueryConfig<WalletDebtData>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	return useQuery<WalletDebtData>(
		QUERY_KEYS.Debt.WalletDebtData(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { SystemSettings, Synthetix, SynthetixState },
				utils,
			} = synthetix.js as any;
			const IssuanceRatioContract = network?.id === 5 ? SystemSettings : SynthetixState;
			const result = await Promise.all([
				IssuanceRatioContract.issuanceRatio(),
				Synthetix.collateralisationRatio(walletAddress),
				Synthetix.transferableSynthetix(walletAddress),
				Synthetix.debtBalanceOf(walletAddress, utils.formatBytes32String('sUSD')),
			]);
			const [targetCRatio, currentCRatio, transferable, debtBalance] = result.map(
				utils.formatEther
			);
			return {
				targetCRatio,
				currentCRatio,
				transferable,
				debtBalance,
			};
		},
		{
			enabled: synthetix.js && isWalletConnected,
			...options,
		}
	);
};

export default useGetDebtDataQuery;
