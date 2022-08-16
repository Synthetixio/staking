import { useState, useMemo, useEffect, FC } from 'react';
import { isAfter, addSeconds, fromUnixTime, differenceInSeconds } from 'date-fns';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import Button from 'components/Button';
import {
  ModalItemTitle as TxModalItemTitle,
  ModalItemText as TxModalItemText,
  NoTextTransform,
  IconButton,
  FlexDivRowCentered,
} from 'styles/common';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import GasSelector from 'components/GasSelector';
import Loans from 'containers/Loans';
import {
  FormContainer,
  InputsContainer,
  InputsDivider,
  SettingsContainer,
  SettingContainer,
  ErrorMessage,
  TxModalContent,
  TxModalItem,
  TxModalItemSeperator,
} from 'sections/loans/components/common';
import AssetInput from 'sections/loans/components/ActionBox/BorrowSynthsTab/AssetInput';
import { Loan } from 'containers/Loans/types';
import AccruedInterest from 'sections/loans/components/ActionBox/components/AccruedInterest';
import CRatio from 'sections/loans/components/ActionBox/components/LoanCRatio';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import Wei, { wei } from '@synthetixio/wei';
import { GasPrice } from '@synthetixio/queries';
import { getSafeMinCRatioBuffer } from 'sections/loans/constants';
import { GasLimitEstimate } from 'constants/network';

type WrapperProps = {
  gasLimit: GasLimitEstimate;
  optimismLayerOneFee: Wei | null;
  leftColLabel: string;
  leftColAssetName: string;
  leftColAmount: string | null;
  onSetLeftColAmount?: (amount: string) => void;
  onSetLeftColMaxAmount?: (amount: string) => void;
  onGasPriceChange: (gasPrice: GasPrice) => void;
  rightColLabel: string;
  rightColAssetName: string;
  rightColAmount: string;
  onSetRightColAmount?: (amount: string) => void;
  onSetRightColMaxAmount?: (amount: string) => void;

  buttonLabel: string;
  buttonIsDisabled: boolean;
  onButtonClick: () => void;

  loan: Loan;

  showCRatio?: boolean;
  showInterestAccrued?: boolean;

  error: string | null;

  txModalOpen: boolean;
  setTxModalOpen: (txModalOpen: boolean) => void;
};

const Wrapper: FC<WrapperProps> = ({
  gasLimit,
  optimismLayerOneFee,

  leftColLabel,
  leftColAssetName,
  leftColAmount,
  onSetLeftColAmount,
  onSetLeftColMaxAmount,
  onGasPriceChange,

  rightColLabel,
  rightColAssetName,
  rightColAmount,
  onSetRightColAmount,
  onSetRightColMaxAmount,

  buttonLabel,
  buttonIsDisabled,
  onButtonClick,

  loan,

  showCRatio,
  showInterestAccrued,

  error,

  txModalOpen,
  setTxModalOpen,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { interactionDelay, minCRatio } = Loans.useContainer();

  const [waitETA, setWaitETA] = useState<string>('');

  const safeMinCRatio = minCRatio
    ? minCRatio.add(getSafeMinCRatioBuffer(loan.currency, loan.collateralAsset))
    : wei(0);

  const onGoBack = () => router.back();
  const onSetleftColAssetName = () => {};
  const onSetrightColAssetName = () => {};

  const nextInteractionDate = useMemo(() => {
    const lastInteractionTime = fromUnixTime(parseInt(loan.lastInteraction.toString()));
    return addSeconds(lastInteractionTime, parseInt(interactionDelay.toString()));
  }, [loan.lastInteraction, interactionDelay]);

  useEffect(() => {
    if (!nextInteractionDate) return;

    let isMounted = true;
    const unsubs: Array<Function> = [() => (isMounted = false)];

    const timer = () => {
      const intervalId = setInterval(() => {
        const now = new Date();
        if (isAfter(now, nextInteractionDate)) {
          return stopTimer();
        }
        if (isMounted) {
          setWaitETA(toHumanizedDuration(wei(differenceInSeconds(nextInteractionDate, now))));
        }
      }, 1000);

      const stopTimer = () => {
        if (isMounted) {
          setWaitETA('');
        }
        clearInterval(intervalId);
      };

      unsubs.push(stopTimer);
    };

    timer();

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [nextInteractionDate]);

  return (
    <>
      <FormContainer>
        <Header>
          <IconButton onClick={onGoBack}>
            <NavigationBack width="16" />
          </IconButton>
        </Header>

        <InputsContainer>
          <AssetInput
            label={leftColLabel}
            asset={leftColAssetName}
            setAsset={onSetleftColAssetName}
            amount={leftColAmount ?? ''}
            setAmount={onSetLeftColAmount || noop}
            assets={[leftColAssetName]}
            selectDisabled={true}
            inputDisabled={!onSetLeftColAmount}
            onSetMaxAmount={onSetLeftColMaxAmount}
          />
          <InputsDivider />
          <AssetInput
            label={rightColLabel}
            asset={rightColAssetName}
            setAsset={onSetrightColAssetName}
            amount={rightColAmount}
            setAmount={onSetRightColAmount || noop}
            assets={[rightColAssetName]}
            selectDisabled={true}
            inputDisabled={!onSetRightColAmount}
            onSetMaxAmount={onSetRightColMaxAmount}
          />
        </InputsContainer>

        <SettingsContainer>
          {!showCRatio ? null : (
            <SettingContainer>
              <CRatio loan={loan} minCRatio={minCRatio || wei(0)} safeMinCRatio={safeMinCRatio} />
            </SettingContainer>
          )}
          {!showInterestAccrued ? null : (
            <SettingContainer>
              <AccruedInterest loan={loan} />
            </SettingContainer>
          )}
          <SettingContainer>
            <GasSelector
              gasLimitEstimate={gasLimit}
              onGasPriceChange={onGasPriceChange}
              optimismLayerOneFee={optimismLayerOneFee}
            />
          </SettingContainer>
        </SettingsContainer>
      </FormContainer>

      <FormButton
        onClick={onButtonClick}
        variant="primary"
        size="lg"
        disabled={!!waitETA || buttonIsDisabled}
      >
        <Trans
          i18nKey={waitETA ? 'loans.modify-loan.loan-interation-delay' : buttonLabel}
          values={{ waitETA }}
          components={[<NoTextTransform />]}
        />
      </FormButton>

      {!error ? null : <ErrorMessage>{error}</ErrorMessage>}

      {txModalOpen && (
        <TxConfirmationModal
          onDismiss={() => setTxModalOpen(false)}
          txError={null}
          attemptRetry={onButtonClick}
          content={
            <TxModalContent>
              <TxModalItem>
                <TxModalItemTitle>{t(leftColLabel)}</TxModalItemTitle>
                <TxModalItemText>
                  {wei(leftColAmount || 0).toString(2)} {leftColAssetName}
                </TxModalItemText>
              </TxModalItem>
              <TxModalItemSeperator />
              <TxModalItem>
                <TxModalItemTitle>{t(rightColLabel)}</TxModalItemTitle>
                <TxModalItemText>
                  {wei(rightColAmount).toString(2)} {rightColAssetName}
                </TxModalItemText>
              </TxModalItem>
            </TxModalContent>
          }
        />
      )}
    </>
  );
};

function noop() {}

function toHumanizedDuration(ms: Wei) {
  const dur: Record<string, Wei> = {};
  const units: Array<any> = [
    { label: 's', mod: 60 },
    { label: 'm', mod: 60 },
    // { label: 'h', mod: 24 },
    // { label: 'd', mod: 31 },
    // {label: "w", mod: 7},
  ];
  units.forEach((u) => {
    const z = (dur[u.label] = wei(ms.toBig().mod(u.mod)));
    ms = ms.sub(z).div(u.mod);
  });
  return units
    .slice()
    .reverse()
    .filter((u) => {
      return u.label !== 'ms'; // && dur[u.label]
    })
    .map((u) => {
      let val = dur[u.label].toString(0);
      if (u.label === 'm' || u.label === 's') {
        val = val.padStart(2, '0');
      }
      return val + u.label;
    })
    .join(':');
}

const Header = styled(FlexDivRowCentered)`
  justify-content: space-between;
  width: 100%;
  padding: 8px;
`;

const FormButton = styled(Button)`
  font-size: 14px;
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
  border-radius: 4px;
  width: 100%;
  text-transform: uppercase;
`;

export default Wrapper;
