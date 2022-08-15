import { useQuery } from 'react-query';
import Connector from 'containers/Connector';
import Wei, { wei } from '@synthetixio/wei';

const useGetSnxAmountToBeLiquidatedUsd = (
  debtBalance?: Wei,
  collateralInUsd?: Wei,
  selfLiquidationPenalty?: Wei,
  liquidationPenalty?: Wei,
  enabled?: boolean
) => {
  const { network, synthetixjs } = Connector.useContainer();

  return useQuery<{ amountToSelfLiquidateUsd: Wei; amountToLiquidateUsd: Wei }>(
    ['selfLiquidationData', network?.id],
    async () => {
      const amountToFixCRatioUsdSelfP =
        synthetixjs?.contracts.Liquidator.calculateAmountToFixCollateral(
          debtBalance?.toBN(),
          collateralInUsd?.toBN(),
          selfLiquidationPenalty?.toBN()
        );
      const amountToFixCratioUsdP =
        synthetixjs?.contracts.Liquidator.calculateAmountToFixCollateral(
          debtBalance?.toBN(),
          collateralInUsd?.toBN(),
          liquidationPenalty?.toBN()
        );

      const [amountToFixCRatioUsdSelf, amountToFixCratioUsd] = await Promise.all([
        amountToFixCRatioUsdSelfP,
        amountToFixCratioUsdP,
      ]).then((x) => x.map((x) => wei(x)));

      return {
        amountToSelfLiquidateUsd: amountToFixCRatioUsdSelf.mul(wei(1).add(selfLiquidationPenalty)),
        amountToLiquidateUsd: amountToFixCratioUsd.mul(wei(1).add(liquidationPenalty)),
      };
    },
    {
      enabled: Boolean(
        enabled &&
          network?.id &&
          synthetixjs?.contracts &&
          selfLiquidationPenalty &&
          liquidationPenalty &&
          collateralInUsd &&
          debtBalance?.gt(0)
      ),
    }
  );
};
export default useGetSnxAmountToBeLiquidatedUsd;
