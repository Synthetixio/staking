import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';
import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';
import { Synths } from 'constants/currency';

const useIBTCShortsQuery = (options?: QueryConfig<any>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<any>(
		QUERY_KEYS.LiquidityPools.iBTC(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { CollateralManager, ExchangeRates },
				utils: { formatBytes32String },
			} = synthetix.js!;

			const [openInterest, [assetUSDPrice]] = await Promise.all([
				CollateralManager.short(synthetix.js?.toBytes32(Synths.iBTC)),
				ExchangeRates.rateAndInvalid(synthetix.js?.toBytes32(Synths.iBTC)),
			]);

			console.log(Number(openInterest));
			console.log(Number(assetUSDPrice));

			return {
				openInterest: Number(openInterest),
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useIBTCShortsQuery;
