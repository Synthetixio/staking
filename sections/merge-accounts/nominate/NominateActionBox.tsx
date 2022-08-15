import { useState, useMemo, useEffect, FC } from 'react';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';

import { truncateAddress } from 'utils/formatters/string';
import Button from 'components/Button';
import Connector from 'containers/Connector';
import Etherscan from 'containers/BlockExplorer';
import StructuredTab from 'components/StructuredTab';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import {
  ModalContent as TxModalContent,
  ModalItemTitle as TxModalItemTitle,
  ModalItemText as TxModalItemText,
  ModalItemSeperator as TxModalItemSeperator,
  NoTextTransform,
  IconButton,
} from 'styles/common';
import GasSelector from 'components/GasSelector';
import { walletAddressState } from 'store/wallet';
import {
  FormContainer,
  InputsContainer,
  SettingsContainer,
  SettingContainer,
  ErrorMessage,
  TxModalItem,
  FormHeader,
} from 'sections/merge-accounts/common';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import WalletIcon from 'assets/svg/app/wallet-purple.svg';
import ROUTES from 'constants/routes';
import { TxWaiting, TxSuccess } from './Tx';
import ConnectOrSwitchNetwork from '../../../components/ConnectOrSwitchNetwork';

const NominateTab: FC = () => {
  const { t } = useTranslation();
  const tabData = useMemo(
    () => [
      {
        title: t('merge-accounts.nominate.title'),
        tabChildren: <NominateTabInner />,
        key: 'main',
      },
    ],
    [t]
  );

  return <StructuredTab singleTab={true} boxPadding={20} tabData={tabData} />;
};

const NominateTabInner: FC = () => {
  const { t } = useTranslation();
  const { connectWallet, synthetixjs, isAppReady, isWalletConnected } = Connector.useContainer();

  const sourceAccountAddress = useRecoilValue(walletAddressState);
  const { blockExplorerInstance } = Etherscan.useContainer();
  const { useSynthetixTxn } = useSynthetixQueries();

  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

  const router = useRouter();
  const onGoBack = () => router.replace(ROUTES.MergeAccounts.Home);

  const [destinationAccountAddress, setDestinationAccountAddress] = useState('');

  const properDestinationAccountAddress = useMemo(
    () =>
      destinationAccountAddress && ethers.utils.isAddress(destinationAccountAddress)
        ? ethers.utils.getAddress(destinationAccountAddress)
        : null,
    [destinationAccountAddress]
  );

  const destinationAccountAddressInputError = useMemo(() => {
    return destinationAccountAddress && !properDestinationAccountAddress
      ? 'invalid-dest-address'
      : ethers.constants.AddressZero === properDestinationAccountAddress
      ? 'dest-is-a-burn-address'
      : properDestinationAccountAddress &&
        sourceAccountAddress &&
        properDestinationAccountAddress === ethers.utils.getAddress(sourceAccountAddress)
      ? 'dest-account-is-self'
      : null;
  }, [properDestinationAccountAddress, sourceAccountAddress, destinationAccountAddress]);

  const txn = useSynthetixTxn(
    'RewardEscrowV2',
    'nominateAccountToMerge',
    [properDestinationAccountAddress],
    gasPrice,
    { enabled: !!properDestinationAccountAddress }
  );

  const txLink = useMemo(
    () => (blockExplorerInstance && txn.hash ? blockExplorerInstance.txLink(txn.hash) : ''),
    [blockExplorerInstance, txn.hash]
  );

  // load any previously nominated account address
  useEffect(() => {
    if (!isAppReady || !synthetixjs) return;
    const {
      contracts: { RewardEscrowV2 },
    } = synthetixjs;
    if (!sourceAccountAddress) return;

    let isMounted = true;
    const unsubs = [
      () => {
        isMounted = false;
      },
    ];

    const load = async () => {
      const nominatedAccountAddress = await RewardEscrowV2.nominatedReceiver(sourceAccountAddress);
      if (isMounted) {
        if (ethers.constants.AddressZero !== nominatedAccountAddress) {
          setDestinationAccountAddress(nominatedAccountAddress);
        }
      }
    };

    const subscribe = () => {
      const contractEvent = RewardEscrowV2.filters.NominateAccountToMerge(sourceAccountAddress);
      const onContractEvent = async (src: string, dest: string) => {
        if (src === sourceAccountAddress) {
          setDestinationAccountAddress(dest);
        }
      };
      RewardEscrowV2.on(contractEvent, onContractEvent);
      unsubs.push(() => {
        RewardEscrowV2.off(contractEvent, onContractEvent);
      });
    };

    load();
    subscribe();
    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [sourceAccountAddress, isAppReady, synthetixjs]);

  // effects

  useEffect(() => {
    switch (txn.txnStatus) {
      case 'prompting':
        setTxModalOpen(true);
        break;

      case 'pending':
        setTxModalOpen(true);
        break;

      // case 'unsent':
      case 'confirmed':
        setTxModalOpen(false);
        break;
    }
  }, [txn.txnStatus]);

  // funcs

  const onEnterAddress = (e: any) => setDestinationAccountAddress((e.target.value ?? '').trim());

  const connectOrBurnOrNominate = async () => {
    if (!isWalletConnected) {
      return connectWallet();
    }

    txn.mutate();
  };

  if (txn.txnStatus === 'pending') {
    return (
      <TxWaiting
        {...{ txLink }}
        fromAddress={sourceAccountAddress}
        toAddress={properDestinationAccountAddress}
      />
    );
  }

  if (txn.txnStatus === 'confirmed') {
    return (
      <TxSuccess
        {...{ txLink }}
        fromAddress={sourceAccountAddress}
        toAddress={properDestinationAccountAddress}
        onDismiss={() => {
          router.push(ROUTES.MergeAccounts.Merge);
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
          <WalletIcon width="54" />
          <AmountInput
            value={destinationAccountAddress}
            placeholder={t('merge-accounts.nominate.input-placeholder')}
            onChange={onEnterAddress}
            disabled={false}
            rows={3}
            autoComplete={'off'}
            spellCheck={false}
            data-testid="form-input"
          />
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
      {isWalletConnected ? (
        <FormButton
          onClick={connectOrBurnOrNominate}
          variant="primary"
          size="lg"
          data-testid="form-button"
          disabled={!properDestinationAccountAddress || !!destinationAccountAddressInputError}
        >
          <Trans
            i18nKey={`merge-accounts.nominate.button-labels.${
              txModalOpen
                ? 'nominating'
                : !destinationAccountAddress
                ? 'enter-address'
                : destinationAccountAddressInputError
                ? destinationAccountAddressInputError
                : 'nominate'
            }`}
            components={[<NoTextTransform />]}
          />
        </FormButton>
      ) : (
        <ConnectOrSwitchNetwork />
      )}

      {!txn.error ? null : <ErrorMessage>{txn.errorMessage}</ErrorMessage>}

      {txModalOpen && (
        <TxConfirmationModal
          onDismiss={() => setTxModalOpen(false)}
          txError={null}
          attemptRetry={connectOrBurnOrNominate}
          content={
            <TxModalItem>
              <TxModalItemTitle>{t('merge-accounts.nominate.tx-waiting.title')}</TxModalItemTitle>

              <TxModalContent>
                <TxModalItem>
                  <TxModalItemTitle>
                    {t('merge-accounts.nominate.tx-waiting.from')}
                  </TxModalItemTitle>
                  <TxModalItemText>{truncateAddress(sourceAccountAddress ?? '')}</TxModalItemText>
                </TxModalItem>
                <TxModalItemSeperator />
                <TxModalItem>
                  <TxModalItemTitle>{t('merge-accounts.nominate.tx-waiting.to')}</TxModalItemTitle>
                  <TxModalItemText>
                    {truncateAddress(properDestinationAccountAddress ?? '')}
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

export default NominateTab;
