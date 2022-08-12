import { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';
import Connector from 'containers/Connector';
import { useLiquidationOptimismSubgraph } from './useLiquidationOptimismSubgraph';

export function useLiquidation() {
	const { useGetLiquidationDataQuery, useGetDebtDataQuery } = useSynthetixQueries();
	const { walletAddress } = Connector.useContainer();

	const liquidationData = useGetLiquidationDataQuery(walletAddress);
	const debtData = useGetDebtDataQuery(walletAddress);

	const issuanceRatio = debtData?.data?.targetCRatio ?? wei(0);
	const cRatio = debtData?.data?.currentCRatio ?? wei(0);
	const liquidationDeadlineForAccount =
		liquidationData?.data?.liquidationDeadlineForAccount ?? wei(0);

	const ratio = issuanceRatio.eq(0) ? 0 : 100 / Number(issuanceRatio);

	const optimismDeadline = useLiquidationOptimismSubgraph();
	const deadline =
		optimismDeadline > 0
			? optimismDeadline
			: Number(liquidationDeadlineForAccount.toString()) * 1000;

	const hasWarning =
		optimismDeadline > 0 || (!liquidationDeadlineForAccount.eq(0) && cRatio.gt(issuanceRatio));

	return {
		hasWarning,
		ratio,
		deadline,
	};
}
