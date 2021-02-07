import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
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
};

const useGetDebtDataQuery = (options?: QueryConfig<WalletDebtData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);

	const network = useRecoilValue(networkState);

	return useQuery<WalletDebtData>(
		QUERY_KEYS.Debt.WalletDebtData(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { SystemSettings, Synthetix },
				utils,
			} = synthetix.js!;
			const sUSDBytes = utils.formatBytes32String('sUSD');
			const result = await Promise.all([
				SystemSettings.issuanceRatio(),
				Synthetix.collateralisationRatio(walletAddress),
				Synthetix.transferableSynthetix(walletAddress),
				Synthetix.debtBalanceOf(walletAddress, sUSDBytes),
				Synthetix.collateral(walletAddress),
				Synthetix.maxIssuableSynths(walletAddress),
				Synthetix.balanceOf(walletAddress),
			]);
			const [
				targetCRatio,
				currentCRatio,
				transferable,
				debtBalance,
				collateral,
				issuableSynths,
				balance,
			] = result.map((item) => toBigNumber(utils.formatEther(item)));
			return {
				targetCRatio,
				currentCRatio,
				transferable,
				debtBalance,
				collateral,
				issuableSynths,
				balance,
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useGetDebtDataQuery;
