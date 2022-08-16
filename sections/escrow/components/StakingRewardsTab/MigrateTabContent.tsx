import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import useEscrowCalculations from 'sections/escrow/hooks/useEscrowCalculations';
import { formatCurrency } from 'utils/formatters/number';
import { CryptoCurrency } from 'constants/currency';
import { InputContainer, InputBox, StyledCTA } from '../common';
import { Transaction, GasLimitEstimate } from 'constants/network';

import GasSelector from 'components/GasSelector';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { ActionCompleted, ActionInProgress } from '../TxSent';

import SNXLogo from 'assets/svg/currencies/crypto/SNX.svg';
import {
  ModalContent,
  ModalItem,
  ModalItemTitle,
  ModalItemText,
  ErrorMessage,
} from 'styles/common';
import { GasPrice } from '@synthetixio/queries';
import Wei from '@synthetixio/wei';

type MigrateTabContentProps = {
  onSubmit: any;
  transactionError: string | null;
  gasEstimateError: string | null;
  txModalOpen: boolean;
  setTxModalOpen: Function;
  gasLimitEstimate: GasLimitEstimate;
  setGasPrice: (gasPrice: GasPrice) => void;
  txHash: string | null;
  transactionState: string;
  setTransactionState: (tx: Transaction) => void;
  optimismLayerOneFee: Wei | null;
};

const MigrateTabContent: FC<MigrateTabContentProps> = ({
  onSubmit,
  transactionError,
  txModalOpen,
  setTxModalOpen,
  gasLimitEstimate,
  gasEstimateError,
  setGasPrice,
  txHash,
  transactionState,
  setTransactionState,
  optimismLayerOneFee,
}) => {
  const { t } = useTranslation();
  const vestingCurrencyKey = CryptoCurrency['SNX'];
  const escrowCalculations = useEscrowCalculations();

  const totalEscrowed = escrowCalculations?.totalEscrowBalance;

  const renderButton = () => (
    <StyledCTA
      blue={true}
      onClick={onSubmit}
      variant="primary"
      size="lg"
      disabled={transactionState !== 'unsent' || !!gasEstimateError}
    >
      {t('escrow.actions.migrate-button')}
    </StyledCTA>
  );

  if (transactionState === 'pending') {
    return <ActionInProgress isMigration={true} hash={txHash as string} />;
  }

  if (transactionState === 'confirmed') {
    return (
      <ActionCompleted
        isMigration={true}
        hash={txHash as string}
        resetTransaction={() => setTransactionState(Transaction.PRESUBMIT)}
      />
    );
  }

  return (
    <>
      <InputContainer>
        <InputBox>
          <SNXLogo width="64" />
          <Data>
            {formatCurrency(vestingCurrencyKey, totalEscrowed, {
              currencyKey: vestingCurrencyKey,
            })}
          </Data>
        </InputBox>
        <SettingsContainer>
          <GasSelector
            gasLimitEstimate={gasLimitEstimate}
            onGasPriceChange={setGasPrice}
            optimismLayerOneFee={optimismLayerOneFee}
          />
        </SettingsContainer>
      </InputContainer>
      {renderButton()}
      <ErrorMessage>{transactionError}</ErrorMessage>
      {txModalOpen && (
        <TxConfirmationModal
          onDismiss={() => setTxModalOpen(false)}
          txError={transactionError}
          attemptRetry={onSubmit}
          content={
            <ModalContent>
              <ModalItem>
                <ModalItemTitle>{t('modals.confirm-transaction.migration.title')}</ModalItemTitle>
                <ModalItemText>
                  {t('modals.confirm-transaction.migration.escrow-schedule')}
                </ModalItemText>
              </ModalItem>
            </ModalContent>
          }
        />
      )}
    </>
  );
};

const Data = styled.p`
  color: ${(props) => props.theme.colors.white};
  font-family: ${(props) => props.theme.fonts.extended};
  font-size: 24px;
`;

const SettingsContainer = styled.div`
  width: 100%;
  border-bottom: ${(props) => `1px solid ${props.theme.colors.grayBlue}`};
  margin-bottom: 16px;
`;

export default MigrateTabContent;
