import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import Connector from 'containers/Connector';
import GasSelector from 'components/GasSelector';

import {
  ModalItemTitle as TxModalItemTitle,
  ModalItemText as TxModalItemText,
} from 'styles/common';
import { DEBT_ASSETS, DEBT_ASSETS_L2, getSafeMinCRatioBuffer } from 'sections/loans/constants';
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
import Loans from 'containers/Loans';
import CRatio from 'sections/loans/components/ActionBox/components/CRatio';
import InterestRate from 'sections/loans/components/ActionBox/components/InterestRate';
import IssuanceFee from 'sections/loans/components/ActionBox/components/IssuanceFee';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import MinCRatio from '../components/MinCRatio';
import FormButton from './FormButton';
import AssetInput from './AssetInput';
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import { parseSafeWei } from 'utils/parse';
import { ethers } from 'ethers';
import { calculateLoanCRatio } from './calculateLoanCRatio';
import { getETHToken } from 'contracts/ethToken';
import { useQuery } from 'react-query';

type BorrowSynthsTabProps = {};
const L1_COLLATERAL_ASSETS: { [asset: string]: string[] } = {
  sETH: ['ETH'],
  sUSD: ['ETH'],
};
const getCollateralAsset = (debtAsset: string, isL2: boolean) => {
  if (isL2) {
    return ['ETH'];
  }
  return L1_COLLATERAL_ASSETS[debtAsset];
};

const BorrowSynthsTab: FC<BorrowSynthsTabProps> = () => {
  const { t } = useTranslation();
  const { synthetixjs, connectWallet, network, isL2, isWalletConnected, walletAddress } =
    Connector.useContainer();
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
  const router = useRouter();

  const { minCRatio } = Loans.useContainer();
  const { useExchangeRatesQuery, useSynthetixTxn, useTokensBalancesQuery } = useSynthetixQueries();

  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);

  const [debtAmountNumber, setDebtAmount] = useState<string>('');
  const [debtAsset, setDebtAsset] = useState<string>('sUSD');

  const debtAmount = parseSafeWei(debtAmountNumber, wei(0));

  const [collateralAmountNumber, setCollateralAmount] = useState<string>('');
  const [collateralAsset, setCollateralAsset] = useState<string>('ETH');

  const ethToken = getETHToken(network);
  const collateralDecimals = ethToken.decimals;
  const collateralAmount = collateralAmountNumber
    ? wei(collateralAmountNumber, collateralDecimals)
    : wei(0);

  const balancesToFetch = [ethToken];
  const balances = useTokensBalancesQuery(balancesToFetch, walletAddress);

  const loanContract = synthetixjs?.contracts.CollateralEth;
  const loanMinCollateralResult = useQuery<Wei>([loanContract?.address], async () => {
    if (!loanContract) return wei(0);
    return wei(await loanContract.minCollateral());
  });

  const minCollateralAmount = loanMinCollateralResult.data || wei(0);

  const hasLowCollateralAmount =
    !collateralAmount.eq(0) && collateralAmount.lt(minCollateralAmount);
  const minCollateralAmountString = minCollateralAmount.toString(2);
  const exchangeRatesQuery = useExchangeRatesQuery();
  const exchangeRates = exchangeRatesQuery.data ?? null;

  const [isBorrowing, setIsBorrowing] = useState<boolean>(false);

  const rawCollateralBalance = balances.data?.ETH?.balance;
  const collateralBalance = rawCollateralBalance || wei(0);

  const debt = { amount: debtAmount, asset: debtAsset };
  const collateral = { amount: collateralAmount, asset: collateralAsset };
  const cratio = calculateLoanCRatio(exchangeRates, collateral, debt);
  const safeMinCratio = minCRatio
    ? minCRatio.add(getSafeMinCRatioBuffer(debtAsset, collateralAsset))
    : wei(0);
  const hasLowCRatio = !collateralAmount.eq(0) && !debtAmount.eq(0) && cratio.lt(safeMinCratio);
  const hasInsufficientCollateral = collateralBalance.lt(minCollateralAmount);

  const shouldOpenTransaction = Boolean(
    debtAmount.gt(0) &&
      collateralAmount.gt(0) &&
      collateralAsset &&
      debtAsset &&
      !hasLowCollateralAmount &&
      !hasLowCRatio &&
      !hasInsufficientCollateral
  );

  const openTxn = useSynthetixTxn(
    'CollateralEth',
    'open',
    [debt.amount.toBN(), ethers.utils.formatBytes32String(debt.asset)],
    {
      ...gasPrice,
      value: collateral.amount.toBN(),
    },
    { enabled: shouldOpenTransaction }
  );
  const openTransactionStatus = openTxn ? openTxn.txnStatus : null;
  useEffect(() => {
    switch (openTransactionStatus) {
      case 'unsent':
        setTxModalOpen(false);
        break;
      case 'pending':
        setTxModalOpen(true);
        break;
      case 'confirmed':
        setDebtAmount('0');
        setCollateralAmount('0');
        setTxModalOpen(false);
        setIsBorrowing(false);
        router.push('/loans/list');
        break;
    }
  }, [openTransactionStatus, router]);

  useEffect(() => {
    const newCollateralAssets = getCollateralAsset(debtAsset, isL2);
    const currentCollateralValid = newCollateralAssets.includes(collateralAsset);
    if (!currentCollateralValid) {
      setCollateralAsset(newCollateralAssets[0]);
    }
  }, [collateralAsset, debtAsset, isL2]);
  return (
    <>
      <FormContainer data-testid="loans-form">
        <InputsContainer>
          <AssetInput
            label="loans.tabs.new.debt.label"
            asset={debtAsset}
            setAsset={setDebtAsset}
            amount={debtAmountNumber}
            setAmount={setDebtAmount}
            assets={isL2 ? DEBT_ASSETS_L2 : DEBT_ASSETS}
            testId="loans-form-left-input"
          />
          <InputsDivider />
          <AssetInput
            label="loans.tabs.new.collateral.label"
            asset={collateralAsset}
            setAsset={setCollateralAsset}
            amount={collateralAmountNumber}
            setAmount={setCollateralAmount}
            assets={getCollateralAsset(debtAsset, isL2)}
            onSetMaxAmount={setCollateralAmount}
            testId="loans-form-right-input"
          />
        </InputsContainer>

        <SettingsContainer>
          <SettingContainer>
            <CRatio
              cratio={cratio}
              hasLowCRatio={hasLowCRatio}
              safeMinCRatio={safeMinCratio}
              minCRatio={minCRatio || wei(0)}
            />
          </SettingContainer>
          <SettingContainer>
            <MinCRatio />
          </SettingContainer>
          <SettingContainer>
            <InterestRate />
          </SettingContainer>
          <SettingContainer>
            <IssuanceFee />
          </SettingContainer>
          <SettingContainer>
            <GasSelector
              optimismLayerOneFee={openTxn.optimismLayerOneFee}
              gasLimitEstimate={openTxn.gasLimit}
              onGasPriceChange={setGasPrice}
            />
          </SettingContainer>
        </SettingsContainer>
      </FormContainer>

      <FormButton
        onClick={async () => {
          if (!isWalletConnected) {
            connectWallet();
            return;
          }
          if (!openTxn) return;
          openTxn.mutate();
          setTxModalOpen(true);
        }}
        {...{
          isWalletConnected,
          collateralAsset,
          debtAsset,
          minCollateralAmountString,
          hasLowCollateralAmount,
          hasLowCRatio,
          isBorrowing,
          hasInsufficientCollateral: !collateralAmount.eq(0) && hasInsufficientCollateral,
          hasBothInputsSet: !debtAmount.eq(0) && !collateralAmount.eq(0),
        }}
      />
      {openTxn && openTxn.isError && <ErrorMessage>{openTxn.errorMessage}</ErrorMessage>}
      {openTxn && txModalOpen && (
        <TxConfirmationModal
          onDismiss={() => setTxModalOpen(false)}
          txError={openTxn.errorMessage}
          attemptRetry={openTxn.mutate}
          content={
            <TxModalContent>
              <TxModalItem>
                <TxModalItemTitle>
                  {t('loans.tabs.new.confirm-transaction.left-panel-label')}
                </TxModalItemTitle>
                <TxModalItemText>
                  {debt.amount.toString(2)} {debt.asset}
                </TxModalItemText>
              </TxModalItem>
              <TxModalItemSeperator />
              <TxModalItem>
                <TxModalItemTitle>
                  {t('loans.tabs.new.confirm-transaction.right-panel-label')}
                </TxModalItemTitle>
                <TxModalItemText>
                  {collateral.amount.toString(2)} {collateral.asset}
                </TxModalItemText>
              </TxModalItem>
            </TxModalContent>
          }
        />
      )}
    </>
  );
};

export default BorrowSynthsTab;
