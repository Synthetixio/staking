import { FC } from 'react';
import { ESTIMATE_VALUE } from 'constants/placeholder';
import { GWEI_DECIMALS } from 'utils/infura';
import Wei, { wei } from '@synthetixio/wei';
import { useTranslation } from 'react-i18next';
import { GasPrice } from '@synthetixio/queries';

const GasPriceDisplay: FC<{
  isL2: boolean;
  gasPrice: GasPrice | null;
  optimismLayerOneFee: Wei | null;
}> = ({ isL2, gasPrice, optimismLayerOneFee }) => {
  const { t } = useTranslation();

  if (!gasPrice) return <>-</>;

  if (!gasPrice.gasPrice) {
    // mainnet
    return (
      <>
        {ESTIMATE_VALUE}
        {wei(gasPrice.baseFeePerGas || 0, 9)
          .add(gasPrice.maxPriorityFeePerGas || 0)
          .toString(2)}
      </>
    );
  }

  if (isL2) {
    const l2Fees = wei(gasPrice.gasPrice, GWEI_DECIMALS);
    // optimism
    return (
      <>
        {t('common.gas-prices.l2-fees')}: {l2Fees.toNumber()} + {t('common.gas-prices.l1-fees')}:
        {' E'}
        {optimismLayerOneFee ? optimismLayerOneFee.toString(4) : 0}
      </>
    );
  }
  // Not optimism, not mainnet
  return (
    <>
      {ESTIMATE_VALUE} {wei(gasPrice.gasPrice || 0, GWEI_DECIMALS).toString(0)}
    </>
  );
};

export default GasPriceDisplay;
