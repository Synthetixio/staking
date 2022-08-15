import { useState, useMemo, useEffect, FC, ChangeEventHandler } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';

import { truncateAddress } from 'utils/formatters/string';
import Button from 'components/Button';
import StructuredTab from 'components/StructuredTab';
import Connector from 'containers/Connector';
import {
  ModalItemTitle as TxModalItemTitle,
  ModalItemText as TxModalItemText,
  NoTextTransform,
} from 'styles/common';
import GasSelector from 'components/GasSelector';

import useSynthetixQueries, {
  Action,
  DELEGATE_APPROVE_CONTRACT_METHODS,
  DELEGATE_GET_IS_APPROVED_CONTRACT_METHODS,
  GasPrice,
} from '@synthetixio/queries';
import {
  FormContainer,
  InputsContainer,
  SettingsContainer,
  SettingContainer,
  ErrorMessage,
  TxModalItem,
} from 'sections/delegate/common';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import ActionSelector from './ActionSelector';
import { isObjectOrErrorWithMessage } from 'utils/ts-helpers';
import { sleep } from 'utils/promise';
import ConnectOrSwitchNetwork from '../../components/ConnectOrSwitchNetwork';

const DelegateForm: FC = () => {
  const { t } = useTranslation();

  const tabData = useMemo(
    () => [
      {
        title: t('delegate.form.title'),
        tabChildren: <Tab />,
        key: 'main',
      },
    ],
    [t]
  );

  return <StructuredTab singleTab={true} boxPadding={20} tabData={tabData} />;
};

const Tab: FC = () => {
  const { t } = useTranslation();
  const { synthetixjs, isAppReady, isWalletConnected, walletAddress } = Connector.useContainer();

  const { useGetDelegateWallets, useSynthetixTxn } = useSynthetixQueries();

  const delegateWalletsQuery = useGetDelegateWallets(walletAddress || '', {
    enabled: Boolean(walletAddress),
  });
  const [action, setAction] = useState<string>(Action.APPROVE_ALL);

  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
  const [delegateAddress, setDelegateAddress] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
  const [buttonState, setButtonState] = useState<string | null>(null);
  const [alreadyDelegated, setAlreadyDelegated] = useState<boolean>(false);

  const properDelegateAddress =
    delegateAddress && ethers.utils.isAddress(delegateAddress) ? delegateAddress : null;
  const delegateAddressIsSelf =
    properDelegateAddress && walletAddress
      ? properDelegateAddress === ethers.utils.getAddress(walletAddress)
      : false;

  const shortenedDelegateAddress = truncateAddress(delegateAddress, 8, 6);

  const onEnterAddress: ChangeEventHandler<HTMLTextAreaElement> = (e) =>
    setDelegateAddress((e.target.value ?? '').trim());

  const txn = useSynthetixTxn(
    'DelegateApprovals',
    DELEGATE_APPROVE_CONTRACT_METHODS.get(action) as string,
    [properDelegateAddress],
    gasPrice,
    {
      enabled: Boolean(properDelegateAddress),
      onSuccess: async () => {
        setDelegateAddress('');
        setAction(Action.APPROVE_ALL);
        await sleep(5000); // wait for subgraph to sync
        delegateWalletsQuery.refetch();
      },
      onError: (e) => {
        if (isObjectOrErrorWithMessage(e)) {
          setError(e.message);
        } else {
          setError(String(e));
        }
      },
      onSettled: () => {
        setButtonState(null);
        setTxModalOpen(false);
      },
    }
  );
  const onButtonClick = async () => {
    txn.mutate();
    setButtonState('delegating');
    setTxModalOpen(true);
  };

  // already delegated
  useEffect(() => {
    const getIsAlreadyDelegated = async () => {
      if (!isAppReady || !synthetixjs) return;
      const {
        contracts: { DelegateApprovals },
      } = synthetixjs;
      if (!(properDelegateAddress && action)) return setAlreadyDelegated(false);
      const alreadyDelegated = await DelegateApprovals[
        DELEGATE_GET_IS_APPROVED_CONTRACT_METHODS.get(action)!
      ](walletAddress, properDelegateAddress);

      setAlreadyDelegated(alreadyDelegated);
    };
    getIsAlreadyDelegated();
  }, [isAppReady, properDelegateAddress, walletAddress, action, synthetixjs]);

  return (
    <div data-testid="form">
      <FormContainer>
        <InputsContainer>
          <AmountInput
            value={delegateAddress}
            placeholder={t('common.form.address-input-placeholder')}
            onChange={onEnterAddress}
            disabled={false}
            rows={3}
            autoComplete={'off'}
            spellCheck={false}
            data-testid="form-input"
          />
        </InputsContainer>

        <SettingsContainer>
          <ActionSelector {...{ action, setAction }} />

          <SettingContainer>
            <GasSelector
              gasLimitEstimate={txn.gasLimit}
              onGasPriceChange={setGasPrice}
              optimismLayerOneFee={txn.optimismLayerOneFee}
            />
          </SettingContainer>
        </SettingsContainer>
      </FormContainer>
      {isWalletConnected ? (
        <FormButton
          onClick={onButtonClick}
          variant="primary"
          size="lg"
          data-testid="form-button"
          disabled={
            !properDelegateAddress || !!buttonState || delegateAddressIsSelf || alreadyDelegated
          }
        >
          <Trans
            i18nKey={`delegate.form.button-labels.${
              buttonState ||
              (!delegateAddress
                ? 'enter-address'
                : delegateAddressIsSelf
                ? 'cannot-delegate-to-self'
                : alreadyDelegated
                ? 'already-delegated'
                : 'delegate')
            }`}
            components={[<NoTextTransform />]}
          />
        </FormButton>
      ) : (
        <ConnectOrSwitchNetwork />
      )}
      {!error ? null : <ErrorMessage>{error}</ErrorMessage>}

      {txModalOpen && (
        <TxConfirmationModal
          onDismiss={() => setTxModalOpen(false)}
          txError={null}
          attemptRetry={onButtonClick}
          content={
            <TxModalItem>
              <TxModalItemTitle>{t('delegate.form.tx-confirmation-title')}</TxModalItemTitle>
              <TxModalItemText>{shortenedDelegateAddress}</TxModalItemText>
            </TxModalItem>
          }
        />
      )}
    </div>
  );
};

const AmountInput = styled.textarea`
  padding: 0;
  font-size: 24px;
  background: transparent;
  font-family: ${(props) => props.theme.fonts.extended};
  text-align: center;
  margin-top: 15px;
  overflow: hidden;
  resize: none;
  color: white;
  border: none;
  outline: none;

  &:disabled {
    color: ${(props) => props.theme.colors.gray};
  }
`;

const FormButton = styled(Button)`
  font-size: 14px;
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
  border-radius: 4px;
  width: 100%;
  text-transform: uppercase;
`;

export default DelegateForm;
