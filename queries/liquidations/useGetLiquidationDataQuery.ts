import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import synthetix from 'lib/synthetix';
import { isWalletConnectedState, networkState, walletAddressState, isL2State } from 'store/wallet';
import { appReadyState } from 'store/app';
import QUERY_KEYS from 'constants/queryKeys';

type LiquidationData = {
	liquidationRatio: BigNumber;
	liquidationDelay: BigNumber;
	liquidationDeadlineForAccount: BigNumber;
};

const useGetLiquidationDataQuery = (options?: QueryConfig<LiquidationData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isL2 = useRecoilValue(isL2State);

	return useQuery<LiquidationData>(
		QUERY_KEYS.Liquidations.LiquidationsData(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { Liquidations },
			} = synthetix.js!;
			const [
				liquidationRatio,
				liquidationDelay,
				liquidationDeadlineForAccount,
			] = await Promise.all([
				Liquidations.liquidationRatio(),
				Liquidations.liquidationDelay(),
				Liquidations.getLiquidationDeadlineForAccount(walletAddress),
			]);
			return {
				liquidationRatio,
				liquidationDelay,
				liquidationDeadlineForAccount,
			};
		},
		{
			enabled: isAppReady && isWalletConnected && walletAddress && !isL2,
			...options,
		}
	);
};

export default useGetLiquidationDataQuery;
