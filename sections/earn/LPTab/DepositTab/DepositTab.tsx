import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';

import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import GasSelector from 'components/GasSelector';
import NumericInput from 'components/Input/NumericInput';
import { formatCryptoCurrency, formatNumber } from 'utils/formatters/number';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import Etherscan from 'containers/BlockExplorer';
import Connector from 'containers/Connector';
import { yearnSNXVault } from 'contracts';

import {
  ExternalLink,
  FlexDivCentered,
  FlexDivColCentered,
  ModalContent,
  ModalItem,
  ModalItemText,
  ModalItemTitle,
} from 'styles/common';
import Currency from 'components/Currency';
import { CryptoCurrency, CurrencyKey } from 'constants/currency';
import TxState from 'sections/earn/TxState';

import {
  TotalValueWrapper,
  Subtext,
  Value,
  StyledButton,
  GreyHeader,
  WhiteSubheader,
  Divider,
  VerifyButton,
  DismissButton,
  ButtonSpacer,
  GreyText,
  LinkText,
  IconWrap,
} from '../../common';
import { CurrencyIconType } from 'components/Currency/CurrencyIcon/CurrencyIcon';
import Wei from '@synthetixio/wei';
import { parseSafeWei } from 'utils/parse';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';

export const getContract = (asset: CurrencyKey, signer: ethers.Signer | null) => {
  if (asset === CryptoCurrency.SNX) {
    return new ethers.Contract(
      yearnSNXVault.address,
      // @ts-ignore
      yearnSNXVault.abi,
      signer as ethers.Signer
    );
  } else {
    throw new Error('unrecognizable asset or signer not set');
  }
};

type DepositTabProps = {
  isDeposit: boolean;
  asset: CurrencyKey;
  icon: CurrencyKey;
  type?: CurrencyIconType;
  userBalance: Wei;
  staked: Wei;
  pricePerShare: Wei;
};

const DepositTab: FC<DepositTabProps> = ({
  asset,
  icon,
  type,
  isDeposit,
  userBalance,
  staked,
  pricePerShare,
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>('');
  const { blockExplorerInstance } = Etherscan.useContainer();
  const { signer, isAppReady } = Connector.useContainer();
  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);

  const { useContractTxn } = useSynthetixQueries();

  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

  const stakedBalanceDisplay = staked.mul(pricePerShare);

  const parsedAmount = parseSafeWei(amount, 0);

  const txn = useContractTxn(
    getContract(asset, signer),
    isDeposit ? 'deposit(uint256)' : 'withdraw(uint256)',
    [parsedAmount.toBN()],
    gasPrice
  );

  const link =
    blockExplorerInstance != null && txn.hash != null
      ? blockExplorerInstance.txLink(txn.hash)
      : undefined;

  useEffect(() => {
    if (txn.txnStatus === 'prompting') {
      setTxModalOpen(true);
    } else if (txn.txnStatus === 'confirmed') {
      setTxModalOpen(false);
    }
  }, [txn.txnStatus]);

  if (txn.txnStatus === 'pending') {
    return (
      <TxState
        isStakingPanel={true}
        isStakingPanelWaitingScreen={true}
        description={null}
        title={
          isDeposit ? t('earn.actions.deposit.in-progress') : t('earn.actions.unstake.in-progress')
        }
        content={
          <StakeTxContainer>
            <PendingConfirmation width="78" />
            <GreyHeader>
              {isDeposit ? t('earn.actions.stake.staking') : t('earn.actions.unstake.unstaking')}
            </GreyHeader>
            <WhiteSubheader>
              {isDeposit
                ? t('earn.actions.stake.amount', {
                    amount: formatNumber(amount),
                    asset: asset,
                  })
                : t('earn.actions.unstake.amount', {
                    amount: formatNumber(amount),
                    asset: asset,
                  })}
            </WhiteSubheader>
            <StakeDivider />
            <GreyText>{t('earn.actions.tx.notice')}</GreyText>
            <ExternalLink href={link}>
              <LinkText>{t('earn.actions.tx.link')}</LinkText>
            </ExternalLink>
          </StakeTxContainer>
        }
      />
    );
  }

  if (txn.txnStatus === 'confirmed') {
    return (
      <TxState
        isStakingPanel={true}
        description={null}
        title={isDeposit ? t('earn.actions.stake.success') : t('earn.actions.unstake.success')}
        content={
          <StakeTxContainer>
            <Success width="78" />
            <GreyHeader>
              {isDeposit ? t('earn.actions.stake.staked') : t('earn.actions.unstake.withdrew')}
            </GreyHeader>
            <WhiteSubheader>
              {isDeposit
                ? t('earn.actions.stake.amount', {
                    amount: formatNumber(amount),
                    asset: asset,
                  })
                : t('earn.actions.unstake.amount', {
                    amount: formatNumber(amount),
                    asset: asset,
                  })}
            </WhiteSubheader>
            <StakeDivider />
            <ButtonSpacer isStakingPanel={true}>
              {link ? (
                <ExternalLink href={link}>
                  <VerifyButton isStakingPanel={true}>{t('earn.actions.tx.verify')}</VerifyButton>
                </ExternalLink>
              ) : null}
              <DismissButton isStakingPanel={true} variant="secondary" onClick={txn.refresh}>
                {t('earn.actions.tx.dismiss')}
              </DismissButton>
            </ButtonSpacer>
          </StakeTxContainer>
        }
      />
    );
  }

  return (
    <>
      <Container>
        <IconWrap>
          <Currency.Icon
            currencyKey={icon}
            width={'38'}
            height={'38'}
            type={type ? type : undefined}
          />
        </IconWrap>
        <InputSection>
          <EmptyDiv />
          <StyledNumericInput
            value={amount}
            placeholder="0.00"
            onChange={(e) => {
              setAmount(e.target.value);
            }}
          />
          <MaxButton
            variant="primary"
            disabled={isDeposit ? userBalance.eq(0) : staked.eq(0)}
            onClick={() => {
              setAmount(isDeposit ? `${userBalance}` : `${stakedBalanceDisplay}`);
            }}
          >
            {t('earn.actions.max')}
          </MaxButton>
        </InputSection>
        <TotalValueWrapper>
          <Subtext>{t('earn.actions.available')}</Subtext>
          <StyledValue>
            {formatCryptoCurrency(isDeposit ? userBalance : stakedBalanceDisplay, {
              currencyKey: asset,
            })}
          </StyledValue>
        </TotalValueWrapper>
        <PaddedButton
          variant="primary"
          onClick={() => txn.mutate()}
          disabled={
            !isAppReady ||
            parsedAmount.lte(0) ||
            parsedAmount.gt(isDeposit ? userBalance : stakedBalanceDisplay)
          }
        >
          {isDeposit
            ? t('earn.actions.deposit.deposit-button', { asset })
            : t('earn.actions.withdraw.withdraw-button', { asset })}
        </PaddedButton>
        <GasSelector
          altVersion={true}
          gasLimitEstimate={txn.gasLimit}
          onGasPriceChange={setGasPrice}
          optimismLayerOneFee={txn.optimismLayerOneFee}
        />
      </Container>
      {txModalOpen && (
        <TxConfirmationModal
          onDismiss={() => setTxModalOpen(false)}
          txError={txn.errorMessage}
          attemptRetry={txn.mutate}
          content={
            <ModalContent>
              <ModalItem>
                <ModalItemTitle>
                  {isDeposit
                    ? t('earn.actions.deposit.depositing')
                    : t('earn.actions.withdraw.withdrawing')}
                </ModalItemTitle>
                <ModalItemText>
                  {isDeposit
                    ? t('earn.actions.deposit.amount', {
                        amount: formatNumber(amount),
                        asset: asset,
                      })
                    : t('earn.actions.withdraw.amount', {
                        amount: formatNumber(amount),
                        asset: asset,
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

const Container = styled(FlexDivColCentered)`
  background-color: ${(props) => props.theme.colors.black};
  height: 100%;
  width: 100%;
  padding-bottom: 10px;
`;

const StyledValue = styled(Value)`
  font-family: ${(props) => props.theme.fonts.interSemiBold};
  font-size: 12px;
`;

const PaddedButton = styled(StyledButton)`
  margin-top: 20px;
  width: 80%;
  text-transform: none;
`;

const MaxButton = styled(StyledButton)`
  width: 20%;
  font-size: 12px;
  height: 24px;
  background-color: ${(props) => props.theme.colors.black};
  color: ${(props) => props.theme.colors.blue};
  border: 1px solid ${(props) => props.theme.colors.blue};
  line-height: 18px;
`;

const InputSection = styled(FlexDivCentered)`
  justify-content: space-between;
  width: 80%;
`;

const EmptyDiv = styled.div`
  width: 20%;
`;

const StyledNumericInput = styled(NumericInput)`
  width: 60%;
  font-size: 24px;
  background: transparent;
  font-family: ${(props) => props.theme.fonts.extended};
  text-align: center;

  &:disabled {
    color: ${(props) => props.theme.colors.gray};
  }
`;

const StakeTxContainer = styled(FlexDivColCentered)``;

const StakeDivider = styled(Divider)`
  margin-top: 5px;
  margin-bottom: 10px;
  width: 215px;
`;

export default DepositTab;
