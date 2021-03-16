import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { toBigNumber } from 'utils/formatters/number';
import BigNumber from 'bignumber.js';

const useDebtOwnership = (block?: number | null, options?: QueryConfig<BigNumber>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<BigNumber>(
		QUERY_KEYS.Gov.DebtOwnership(walletAddress ?? '', network?.id!, block),
		async () => {
			const {
				contracts: { SynthetixState },
				utils: { formatUnits },
			} = synthetix.js!;

			let issuanceData = await SynthetixState.issuanceData(walletAddress, {
				blockTag: block ? block : 'latest',
			});

			const debtOwnership = toBigNumber(
				formatUnits(issuanceData.initialDebtOwnership.toString(), 27)
			);

			return debtOwnership;
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useDebtOwnership;
