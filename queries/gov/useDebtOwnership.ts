import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import Wei, { wei } from '@synthetixio/wei';

const useDebtOwnership = (block?: number | null, options?: UseQueryOptions<Wei>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<Wei>(
		QUERY_KEYS.Gov.DebtOwnership(walletAddress ?? '', network?.id!, block),
		async () => {
			const {
				contracts: { SynthetixState },
				utils: { formatUnits },
			} = synthetix.js!;

			let issuanceData = await SynthetixState.issuanceData(walletAddress, {
				blockTag: block ? block : 'latest',
			});

			const debtOwnership = wei(formatUnits(issuanceData.initialDebtOwnership.toString(), 27));

			return debtOwnership;
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useDebtOwnership;
