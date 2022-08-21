import { useState, useMemo, useEffect, FC } from 'react';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';

import ROUTES from 'constants/routes';
import Button from 'components/Button';
import Connector from 'containers/Connector';
import Etherscan from 'containers/BlockExplorer';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import {
  ModalContent as TxModalContent,
  ModalItemTitle as TxModalItemTitle,
  ModalItemText as TxModalItemText,
  NoTextTransform,
  IconButton,
} from 'styles/common';
import StructuredTab from 'components/StructuredTab';
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
import { TxWaiting, TxSuccess } from './Tx';
import ConnectOrSwitchNetwork from 'components/ConnectOrSwitchNetwork';

const MergeTab: FC = () => {
  const { t } = useTranslation();

  const tabData = useMemo(
    () => [
      {
        title: t('merge-accounts.merge.title'),
        tabChildren: <MergeTabInner />,
        key: 'main',
      },
    ],
    [t]
  );

  return <StructuredTab singleTab={true} boxPadding={20} tabData={tabData} />;
};

const MergeTabInner: FC = () => {
  const { t } = useTranslation();
  const { connectWallet, synthetixjs, isAppReady, isWalletConnected } = Connector.useContainer();

  const destinationAccountAddress = useRecoilValue(walletAddressState);
  const { blockExplorerInstance } = Etherscan.useContainer();
  const { useSynthetixTxn } = useSynthetixQueries();

  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

  const router = useRouter();
  const onGoBack = () => router.replace(ROUTES.MergeAccounts.Home);

  const [sourceAccountAddress, setSourceAccountAddress] = useState('');
  const [nominatedAccountAddress, setNominatedAccountAddress] = useState('');
  const [entryIDs, setEntryIDs] = useState([]);

  const properSourceAccountAddress = useMemo(
    () =>
      sourceAccountAddress && ethers.utils.isAddress(sourceAccountAddress)
        ? ethers.utils.getAddress(sourceAccountAddress)
        : null,
    [sourceAccountAddress]
  );

  const sourceAccountAddressInputError = useMemo(() => {
    return sourceAccountAddress && !properSourceAccountAddress
      ? 'invalid-dest-address'
      : ethers.constants.AddressZero === properSourceAccountAddress
      ? 'source-is-a-burn-address'
      : properSourceAccountAddress &&
        destinationAccountAddress &&
        properSourceAccountAddress === ethers.utils.getAddress(destinationAccountAddress)
      ? 'source-account-is-self'
      : nominatedAccountAddress &&
        destinationAccountAddress &&
        nominatedAccountAddress !== ethers.utils.getAddress(destinationAccountAddress)
      ? 'not-nominated'
      : null;
  }, [
    properSourceAccountAddress,
    destinationAccountAddress,
    nominatedAccountAddress,
    sourceAccountAddress,
  ]);

  const txn = useSynthetixTxn(
    'RewardEscrowV2',
    'mergeAccount',
    [properSourceAccountAddress, entryIDs],
    gasPrice,
    {
      enabled: !!properSourceAccountAddress, // && !!entryIDs.length
    }
  );

  const txLink = useMemo(
    () => (blockExplorerInstance && txn.hash ? blockExplorerInstance.txLink(txn.hash) : ''),
    [blockExplorerInstance, txn.hash]
  );

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

  // load any nominated account address
  useEffect(() => {
    if (!isAppReady || !synthetixjs) return;
    const {
      contracts: { RewardEscrowV2 },
    } = synthetixjs;
    if (!properSourceAccountAddress) return;

    let isMounted = true;
    const unsubs = [
      () => {
        isMounted = false;
      },
    ];

    const load = async () => {
      const nominatedAccountAddress = await RewardEscrowV2.nominatedReceiver(
        properSourceAccountAddress
      );
      if (isMounted) {
        if (ethers.constants.AddressZero !== nominatedAccountAddress) {
          setNominatedAccountAddress(nominatedAccountAddress);
        }
        setEntryIDs(entryIDs);
      }
    };

    const subscribe = () => {
      const contractEvent = RewardEscrowV2.filters.NominateAccountToMerge(
        properSourceAccountAddress
      );
      const onContractEvent = async (src: string, dest: string) => {
        if (src === destinationAccountAddress) {
          setNominatedAccountAddress(dest);
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
  }, [destinationAccountAddress, properSourceAccountAddress, entryIDs, isAppReady, synthetixjs]);

  // load nominated account address
  useEffect(() => {
    if (!isAppReady || !synthetixjs) return;
    const {
      contracts: { RewardEscrowV2 },
    } = synthetixjs;
    if (!properSourceAccountAddress) return;

    let isMounted = true;
    const unsubs = [
      () => {
        isMounted = false;
      },
    ];

    const load = async () => {
      const numVestingEntries = await RewardEscrowV2.numVestingEntries(properSourceAccountAddress);
      const entryIDs = numVestingEntries.eq(0)
        ? []
        : await RewardEscrowV2.getAccountVestingEntryIDs(
            properSourceAccountAddress,
            0,
            numVestingEntries
          );

      if (isMounted) {
        setEntryIDs(entryIDs);
      }
    };

    load();

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [properSourceAccountAddress, isAppReady, synthetixjs]);

  // funcs

  const onEnterAddress = (e: any) => setSourceAccountAddress((e.target.value ?? '').trim());

  const connectOrMerge = async () => {
    if (!isWalletConnected) {
      return connectWallet();
    }

    txn.mutate();
  };

  if (txn.txnStatus === 'pending') {
    return <TxWaiting {...{ txLink }} />;
  }

  if (txn.txnStatus === 'confirmed') {
    return (
      <TxSuccess
        {...{ txLink }}
        onDismiss={() => {
          router.push(ROUTES.Escrow.Home);
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
            value={sourceAccountAddress}
            placeholder={t('merge-accounts.merge.input-placeholder')}
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
          onClick={connectOrMerge}
          variant="primary"
          size="lg"
          data-testid="form-button"
          disabled={!properSourceAccountAddress || !!sourceAccountAddressInputError}
        >
          <Trans
            i18nKey={`merge-accounts.merge.button-labels.${
              txModalOpen
                ? 'merging'
                : !sourceAccountAddress
                ? 'enter-address'
                : sourceAccountAddressInputError
                ? sourceAccountAddressInputError
                : 'merge'
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
          attemptRetry={connectOrMerge}
          content={
            <TxModalItem>
              <TxModalItemTitle>{t('merge-accounts.merge.tx-waiting.title')}</TxModalItemTitle>
              <TxModalContent>
                <TxModalItem>
                  <TxModalItemTitle>
                    {t('merge-accounts.merge.tx-waiting.merging')}
                  </TxModalItemTitle>
                  <TxModalItemText>
                    {t('merge-accounts.merge.tx-waiting.escrowed-schedule')}
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

export default MergeTab;
