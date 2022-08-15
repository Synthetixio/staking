import { FC, useState, useMemo } from 'react';
import styled from 'styled-components';
import { Trans } from 'react-i18next';
import Wei from '@synthetixio/wei';
import { Balances, DeprecatedSynthBalance } from '@synthetixio/queries';

import Button from 'components/Button';
import TransactionNotifier from 'containers/TransactionNotifier';
import RedeemableDeprecatedSynthsModal from 'sections/synths/components/RedeemableDeprecatedSynthsModal';

const RedeemableDeprecatedSynthsButton: FC<{
  redeemableDeprecatedSynthsQuery: any;
  synthBalances: Balances | null;
  redeemAmount: Wei;
  redeemBalances: DeprecatedSynthBalance[];
}> = ({ redeemableDeprecatedSynthsQuery, synthBalances, redeemAmount, redeemBalances }) => {
  const [isRedeemingDeprecatedSynths, setIsRedeemingDeprecatedSynths] = useState(false);
  const { monitorTransaction } = TransactionNotifier.useContainer();

  const redeemableDeprecatedSynthsAddresses: string[] = useMemo(
    () => redeemBalances.map((s: DeprecatedSynthBalance) => s.proxyAddress),
    [redeemBalances]
  );

  const handleRedeemConfirmation = (txHash: string | null) => {
    setIsRedeemingDeprecatedSynths(false);
    if (txHash) {
      monitorTransaction({
        txHash,
        onTxConfirmed: () => {
          setTimeout(() => {
            redeemableDeprecatedSynthsQuery.refetch();
          }, 1000 * 5);
        },
        onTxFailed: (error) => {
          console.log(`Transaction failed: ${error}`);
        },
      });
    }
  };

  return (
    <>
      <StyledButtonBlue onClick={() => setIsRedeemingDeprecatedSynths(true)}>
        <Trans i18nKey="synths.redeemable-deprecated-synths.redeem" values={{}} components={[]} />
      </StyledButtonBlue>

      {isRedeemingDeprecatedSynths && redeemableDeprecatedSynthsAddresses.length ? (
        <RedeemableDeprecatedSynthsModal
          {...{ redeemAmount, redeemableDeprecatedSynthsAddresses, redeemBalances, synthBalances }}
          onDismiss={() => setIsRedeemingDeprecatedSynths(false)}
          onRedeemConfirmation={handleRedeemConfirmation}
        />
      ) : null}
    </>
  );
};

export const StyledButtonBlue = styled(Button).attrs({ variant: 'secondary' })``;

export default RedeemableDeprecatedSynthsButton;
