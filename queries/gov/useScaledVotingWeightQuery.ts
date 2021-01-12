import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { quadraticWeighting } from 'constants/snapshot';
import { toBigNumber } from 'utils/formatters/number';

const useScaledVotingWeightQuery = (options?: QueryConfig<number>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<number>(
		QUERY_KEYS.Gov.ScaledVotingWeight(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { SynthetixState },
				utils: { formatUnits },
			} = synthetix.js!;

			let issuanceData = await SynthetixState.issuanceData(walletAddress, { blockTag: 11509852 });

			console.log(formatUnits(issuanceData.initialDebtOwnership.toString(), 27));
			// console.log(issuanceData.initialDebtOwnership.toString());

			const scaledVotingWeight = quadraticWeighting(
				toBigNumber(formatUnits(issuanceData.initialDebtOwnership.toString(), 27))
			);

			return Number(scaledVotingWeight);
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useScaledVotingWeightQuery;
