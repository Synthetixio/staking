import { useMemo, useEffect, FC, useCallback } from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import Wei, { wei } from '@synthetixio/wei';
import StructuredTab from 'components/StructuredTab';
import Etherscan from 'containers/BlockExplorer';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import GasSelector from 'components/GasSelector';
import { BurnActionType } from 'store/staking';
import {
  ModalContent as TxModalContent,
  ModalItemTitle as TxModalItemTitle,
  ModalItemText as TxModalItemText,
  ModalItemSeperator as TxModalItemSeperator,
  NoTextTransform,
  GlowingCircle,
  IconButton,
} from 'styles/common';
import { StyledCTA } from 'sections/staking/components/common';
import {
  FormContainer,
  InputsContainer,
  SettingsContainer,
  SettingContainer,
  TxModalItem,
  FormHeader,
} from 'sections/merge-accounts/common';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { formatCryptoCurrency, formatNumber } from 'utils/formatters/number';
import { DEFAULT_FIAT_DECIMALS } from 'constants/defaults';
import ROUTES from 'constants/routes';
import Currency from 'components/Currency';
import { CryptoCurrency, Synths } from 'constants/currency';
import { parseSafeWei } from 'utils/parse';
import { getStakingAmount } from 'sections/staking/components/helper';
import useBurnTx from 'sections/staking/hooks/useBurnTx';

import { TxWaiting, TxSuccess } from './Tx';
import ConnectOrSwitchNetwork from 'components/ConnectOrSwitchNetwork';

const BurnTab: FC = () => {
  const { t } = useTranslation();

  const tabData = useMemo(
    () => [
      {
        title: t('merge-accounts.burn.title'),
        tabChildren: <BurnTabInner />,
        key: 'main',
      },
    ],
    [t]
  );

  return <StructuredTab singleTab={true} boxPadding={20} tabData={tabData} />;
};

const BurnTabInner: FC = () => {
  const { t } = useTranslation();

  const router = useRouter();
  const { blockExplorerInstance } = Etherscan.useContainer();

  const {
    debtBalance,
    sUSDBalance,
    issuableSynths,
    txn,
    onBurnChange,
    onBurnTypeChange,
    error,
    txModalOpen,
    setTxModalOpen,
    setGasPrice,
    isWalletConnected,
    targetCRatio,
    SNXRate,
    currentCRatio,
  } = useBurnTx();

  const stakeInfo = useCallback(
    (burnAmount: Wei): Wei => wei(getStakingAmount(targetCRatio, burnAmount, SNXRate)),
    [SNXRate, targetCRatio]
  );
  // This is the amount we send along with the transaction, burnSynths() will only burn the debtbalance either way
  // This protects us from dust when debtBalance fluctuates
  const burnAmount = sUSDBalance;
  // This is what gets displayed in the ui
  const burnAmountUi = debtBalance.gt(sUSDBalance) ? wei(sUSDBalance) : debtBalance;

  const unstakeAmount = useMemo(() => {
    const calculatedTargetBurn = Math.max(debtBalance.sub(issuableSynths).toNumber(), 0);
    if (currentCRatio.gt(targetCRatio) && parseSafeWei(burnAmountUi, 0).lte(calculatedTargetBurn)) {
      return stakeInfo(wei(0));
    } else {
      return stakeInfo(burnAmountUi);
    }
  }, [burnAmountUi, debtBalance, issuableSynths, targetCRatio, currentCRatio, stakeInfo]);

  const txLink = useMemo(
    () => (blockExplorerInstance && txn.hash ? blockExplorerInstance.txLink(txn.hash) : ''),
    [blockExplorerInstance, txn.hash]
  );

  const onGoBack = () => router.replace(ROUTES.MergeAccounts.Home);

  const onBurn = useCallback(() => txn.mutate(), [txn]);

  useEffect(() => {
    onBurnChange(burnAmount.toString());
    onBurnTypeChange(BurnActionType.MAX);
  }, [onBurnChange, onBurnTypeChange, burnAmount]);

  const returnButtonStates = useMemo(() => {
    if (!isWalletConnected) {
      return <ConnectOrSwitchNetwork />;
    } else if (error) {
      return (
        <StyledCTA variant="primary" size="lg" disabled={true}>
          {error}
        </StyledCTA>
      );
    } else {
      return (
        <StyledCTA
          onClick={onBurn}
          variant="primary"
          size="lg"
          disabled={txn.txnStatus !== 'unsent'}
        >
          <Trans i18nKey={'staking.actions.burn.action.burn'} components={[<NoTextTransform />]} />
        </StyledCTA>
      );
    }
  }, [error, txn.txnStatus, isWalletConnected, onBurn]);

  if (txn.txnStatus === 'pending') {
    return <TxWaiting {...{ unstakeAmount, burnAmount: burnAmountUi, txLink }} />;
  }

  if (txn.txnStatus === 'confirmed') {
    return (
      <TxSuccess
        {...{ unstakeAmount, burnAmount: burnAmountUi, txLink }}
        onDismiss={() => {
          router.push(ROUTES.MergeAccounts.Nominate);
        }}
      />
    );
  }

  return (
    <div data-testid="form">
      <FormContainer>
        <FormHeader>
          <IconButton onClick={onGoBack}>
            <NavigationBack width="16" />
          </IconButton>
        </FormHeader>

        <InputsContainer>
          <GlowingCircle variant="blue" size="md">
            <Currency.Icon currencyKey={Synths.sUSD} width="52" height="52" />
          </GlowingCircle>
          <AmountLabel>{formatCryptoCurrency(debtBalance.toString())}</AmountLabel>
        </InputsContainer>

        <SettingsContainer>
          <SettingContainer>
            <GasSelector
              gasLimitEstimate={txn.gasLimit}
              onGasPriceChange={setGasPrice}
              optimismLayerOneFee={txn.optimismLayerOneFee}
            />
          </SettingContainer>
        </SettingsContainer>
      </FormContainer>

      {returnButtonStates}

      {txModalOpen && (
        <TxConfirmationModal
          onDismiss={() => setTxModalOpen(false)}
          txError={null}
          attemptRetry={onBurn}
          content={
            <TxModalItem>
              <TxModalItemTitle>{t('merge-accounts.burn.tx-waiting.title')}</TxModalItemTitle>
              <TxModalContent>
                <TxModalItem>
                  <TxModalItemTitle>
                    {t('merge-accounts.burn.tx-waiting.unstaking')}
                  </TxModalItemTitle>
                  <TxModalItemText>
                    {t('merge-accounts.burn.tx-waiting.unstake-amount', {
                      amount: formatNumber(unstakeAmount, {
                        minDecimals: DEFAULT_FIAT_DECIMALS,
                        maxDecimals: DEFAULT_FIAT_DECIMALS,
                      }),
                      asset: Synths.sUSD,
                    })}
                  </TxModalItemText>
                </TxModalItem>
                <TxModalItemSeperator />
                <TxModalItem>
                  <TxModalItemTitle>{t('merge-accounts.burn.tx-waiting.burning')}</TxModalItemTitle>
                  <TxModalItemText>
                    {t('merge-accounts.burn.tx-waiting.burn-amount', {
                      amount: formatNumber(burnAmountUi, {
                        minDecimals: DEFAULT_FIAT_DECIMALS,
                        maxDecimals: DEFAULT_FIAT_DECIMALS,
                      }),
                      asset: CryptoCurrency.SNX,
                    })}
                  </TxModalItemText>
                </TxModalItem>
              </TxModalContent>
            </TxModalItem>
          }
        />
      )}
    </div>
  );
};

const AmountLabel = styled.p`
  color: ${(props) => props.theme.colors.white};
  font-family: ${(props) => props.theme.fonts.extended};
  font-size: 24px;
`;

export default BurnTab;
