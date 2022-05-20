import { useQuery } from 'react-query';
import Connector from 'containers/Connector';
import Wei, { wei } from '@synthetixio/wei';

const useLiquidationAmountToFixCollateral = (
	debtBalance: Wei,
	collateralInUsd: Wei,
	selfLiquidationPenalty?: Wei,
	liquidationPenalty?: Wei
) => {
	const { network, synthetixjs } = Connector.useContainer();

	return useQuery<{ amountToSelfLiquidateUsd: Wei; amountToLiquidateUsd: Wei }>(
		['selfLiquidationData', network?.id],
		async () => {
			const amountToSelfLiquidateUsdP =
				synthetixjs?.contracts.Liquidator.calculateAmountToFixCollateral(
					debtBalance.toBN(),
					collateralInUsd.toBN(),
					selfLiquidationPenalty?.toBN()
				);
			const amountToLiquidateUsdP =
				synthetixjs?.contracts.Liquidator.calculateAmountToFixCollateral(
					debtBalance.toBN(),
					collateralInUsd.toBN(),
					liquidationPenalty?.toBN()
				);

			const [amountToSelfLiquidateUsd, amountToLiquidateUsd] = await Promise.all([
				amountToSelfLiquidateUsdP,
				amountToLiquidateUsdP,
			]).then((x) => x.map((x) => wei(x)));

			return { amountToSelfLiquidateUsd, amountToLiquidateUsd };
		},
		{
			enabled: Boolean(
				network?.id && synthetixjs?.contracts && selfLiquidationPenalty && liquidationPenalty
			),
		}
	);
};
export default useLiquidationAmountToFixCollateral;
