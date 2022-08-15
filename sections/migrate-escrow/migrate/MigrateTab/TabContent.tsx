import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import router from 'next/router';

import { formatCurrency } from 'utils/formatters/number';
import { CryptoCurrency } from 'constants/currency';
import { GasLimitEstimate } from 'constants/network';
import { InputContainer, InputBox } from '../../components/common';
import ROUTES from 'constants/routes';

import GasSelector from 'components/GasSelector';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { ActionCompleted, ActionInProgress } from '../../components/TxSent';

import SNXLogo from 'assets/svg/currencies/crypto/SNX.svg';
import { StyledCTA } from '../../components/common';
import {
  ModalContent,
  ModalItem,
  ModalItemTitle,
  ModalItemText,
  ErrorMessage,
} from 'styles/common';
import Wei from '@synthetixio/wei';
import { GasPrice } from '@synthetixio/queries';

type TabContentProps = {
  escrowedAmount: Wei;
  onSubmit: any;
  transactionError: string | null;
  gasEstimateError: string | null;
  txModalOpen: boolean;
  setTxModalOpen: Function;
  gasLimitEstimate: GasLimitEstimate;
  setGasPrice: (gasPrice: GasPrice) => void;
  txHash: string | null;
  transactionState: 'unsent' | string;
  isVestNeeded: boolean;
  resetTransaction: () => void;
  optimismLayerOneFee: Wei | null;
};

const TabContent: FC<TabContentProps> = ({
  escrowedAmount,
  onSubmit,
  transactionError,
  txModalOpen,
  setTxModalOpen,
  gasLimitEstimate,
  gasEstimateError,
  setGasPrice,
  txHash,
  transactionState,
  resetTransaction,
  isVestNeeded,
  optimismLayerOneFee,
}) => {
  const { t } = useTranslation();
  const vestingCurrencyKey = CryptoCurrency['SNX'];

  const renderButton = () => {
    if (isVestNeeded) {
      return (
        <StyledCTA
          onClick={() => router.push(ROUTES.Escrow.Home)}
          blue={true}
          variant="primary"
          size="lg"
          disabled={false}
        >
          {t('migrate-escrow.actions.migrate.action.go-to-escrow-page')}
        </StyledCTA>
      );
    } else if (escrowedAmount) {
      return (
        <StyledCTA
          blue={true}
          onClick={onSubmit}
          variant="primary"
          size="lg"
          disabled={transactionState !== 'unsent' || !!gasEstimateError}
        >
          {t('migrate-escrow.actions.migrate.action.migrate-button', {
            escrowedAmount: formatCurrency(vestingCurrencyKey, escrowedAmount, {
              currencyKey: vestingCurrencyKey,
            }),
          })}
        </StyledCTA>
      );
    } else {
      return (
        <StyledCTA blue={true} variant="primary" size="lg" disabled={true}>
          {t('migrate-escrow.actions.migrate.action.disabled')}
        </StyledCTA>
      );
    }
  };

  if (transactionState === 'pending') {
    return (
      <ActionInProgress
        action="migrate"
        amount={escrowedAmount.toString()}
        currencyKey={vestingCurrencyKey}
        hash={txHash as string}
      />
    );
  }

  if (transactionState === 'confirmed') {
    return (
      <ActionCompleted
        action="migrate"
        currencyKey={vestingCurrencyKey}
        hash={txHash as string}
        amount={escrowedAmount.toString()}
        resetTransaction={resetTransaction}
      />
    );
  }

  return (
    <>
      <InputContainer>
        <InputBox>
          <SNXLogo width="64" />
          <Data>
            {formatCurrency(vestingCurrencyKey, escrowedAmount, {
              currencyKey: vestingCurrencyKey,
              minDecimals: 2,
              maxDecimals: 2,
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
      {isVestNeeded ? (
        <ErrorMessage>{t('migrate-escrow.actions.migrate.action.vest-needed')}</ErrorMessage>
      ) : (
        <ErrorMessage>{transactionError || gasEstimateError}</ErrorMessage>
      )}

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
                  {formatCurrency(vestingCurrencyKey, escrowedAmount, {
                    currencyKey: vestingCurrencyKey,
                    minDecimals: 4,
                    maxDecimals: 4,
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

export default TabContent;
