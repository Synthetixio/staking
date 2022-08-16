import useSynthetixQueries from '@synthetixio/queries';
import React, { useState } from 'react';
import { ModalContent, ModalItem, ModalItemTitle, ModalItemText } from 'styles/common';
import Button from 'components/Button';
import { formatCryptoCurrency } from 'utils/formatters/number';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import Wei from '@synthetixio/wei';
import styled from 'styled-components';
import { Synths } from 'constants/currency';
import { useTranslation } from 'react-i18next';

const BurnMaxButton: React.FC<{ amountToBurn: Wei }> = ({ amountToBurn }) => {
  const { useSynthetixTxn } = useSynthetixQueries();
  const { t } = useTranslation();
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

  const txn = useSynthetixTxn(
    'Synthetix',
    'burnSynths',
    [amountToBurn.toBN()],
    {},
    { enabled: amountToBurn.gt(0) }
  );
  return (
    <>
      <StyledButton
        data-testid="burn-max-btn"
        variant={'primary'}
        onClick={() => {
          setTxModalOpen(true);
          txn.mutate();
        }}
      >
        {t('staking.actions.burn.action.burn-all')}
      </StyledButton>
      {txModalOpen && (
        <TxConfirmationModal
          onDismiss={() => setTxModalOpen(false)}
          txError={txn.errorMessage}
          attemptRetry={txn.mutate}
          content={
            <ModalContent>
              <ModalItem>
                <ModalItemTitle>{t('staking.actions.burn.in-progress.burning')}</ModalItemTitle>
                <ModalItemText>
                  {formatCryptoCurrency(amountToBurn, {
                    sign: '$',
                    currencyKey: Synths.sUSD,
                    minDecimals: 2,
                  })}
                </ModalItemText>
              </ModalItem>
            </ModalContent>
          }
        />
      )}
    </>
  );
};

const StyledButton = styled(Button)`
  text-transform: none;
`;
export default BurnMaxButton;
