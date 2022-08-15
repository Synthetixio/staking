import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { formatCurrency } from 'utils/formatters/number';
import { CryptoCurrency } from 'constants/currency';
import { InputContainer, InputBox } from '../common';
import { GasLimitEstimate } from 'constants/network';

import GasSelector from 'components/GasSelector';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { ActionCompleted, ActionInProgress } from '../TxSent';

import SNXLogo from 'assets/svg/currencies/crypto/SNX.svg';
import { StyledCTA } from '../common';
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
  claimableAmount: Wei;
  onSubmit: any;
  transactionError: string | null;
  gasEstimateError: string | null;
  txModalOpen: boolean;
  setTxModalOpen: Function;
  gasLimitEstimate: GasLimitEstimate;
  setGasPrice: (gasPrice: GasPrice) => void;
  txHash: string | null;
  transactionState: 'unsent' | string;
  onResetTransaction: () => void;
  optimismLayerOneFee: Wei | null;
};

const TabContent: FC<TabContentProps> = ({
  claimableAmount,
  onSubmit,
  transactionError,
  txModalOpen,
  setTxModalOpen,
  gasLimitEstimate,
  gasEstimateError,
  setGasPrice,
  txHash,
  transactionState,
  onResetTransaction,
  optimismLayerOneFee,
}) => {
  const { t } = useTranslation();
  const vestingCurrencyKey = CryptoCurrency['SNX'];

  const renderButton = () => {
    if (claimableAmount.gt(0)) {
      return (
        <StyledCTA
          blue={true}
          onClick={onSubmit}
          variant="primary"
          size="lg"
          disabled={transactionState !== 'unsent' || !!gasEstimateError}
        >
          {t('escrow.actions.vest-button', {
            canVestAmount: formatCurrency(vestingCurrencyKey, claimableAmount, {
              currencyKey: vestingCurrencyKey,
            }),
          })}
        </StyledCTA>
      );
    } else {
      return (
        <StyledCTA blue={true} variant="primary" size="lg" disabled={true}>
          {t('escrow.actions.disabled')}
        </StyledCTA>
      );
    }
  };

  if (transactionState === 'pending') {
    return (
      <ActionInProgress
        vestingAmount={claimableAmount.toString()}
        currencyKey={vestingCurrencyKey}
        hash={txHash as string}
      />
    );
  }

  if (transactionState === 'confirmed') {
    return (
      <ActionCompleted
        currencyKey={vestingCurrencyKey}
        hash={txHash as string}
        vestingAmount={claimableAmount.toString()}
        resetTransaction={onResetTransaction}
      />
    );
  }

  return (
    <>
      <InputContainer>
        <InputBox>
          <SNXLogo width="64" />
          <Data>
            {formatCurrency(vestingCurrencyKey, claimableAmount, {
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
      <ErrorMessage>{transactionError}</ErrorMessage>
      {txModalOpen && (
        <TxConfirmationModal
          onDismiss={() => setTxModalOpen(false)}
          txError={transactionError}
          attemptRetry={onSubmit}
          content={
            <ModalContent>
              <ModalItem>
                <ModalItemTitle>{t('modals.confirm-transaction.vesting.title')}</ModalItemTitle>
                <ModalItemText>
                  {formatCurrency(vestingCurrencyKey, claimableAmount, {
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
