import { dSNXPoolContractOptimism, SLIPPAGE } from 'constants/dhedge';
import React, { useState } from 'react';
import styled from 'styled-components';
import { utils } from 'ethers';
import useSynthetixQueries from '@synthetixio/queries';
import { constants } from 'ethers';
import GasSelector from 'components/GasSelector';
import { GasPrice } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import {
  InputWrapper,
  PoweredByContainer,
  StyledBackgroundTab,
  StyledBalance,
  StyledButton,
  StyledCryptoCurrencyBox,
  StyledCryptoCurrencyImage,
  StyledHedgeInput,
  StyledInputLabel,
  StyledMaxButton,
  StyledSpacer,
  TorosLogo,
} from './hedge-tab-ui-components';
import Dhedge from 'assets/svg/app/dhedge.svg';
import { useTranslation } from 'react-i18next';
import { formatCryptoCurrency } from 'utils/formatters/number';
import Connector from 'containers/Connector';
import useGetDSnxBalance from 'hooks/useGetDSnxBalance';
import LoaderIcon from 'assets/svg/app/loader.svg';
import useGetNeedsApproval from 'hooks/useGetNeedsApproval';
import useGetDSNXPrice from 'hooks/useGetDSNXPrice';
import {
  ExternalLink,
  ModalContent,
  ModalItem,
  ModalItemText,
  ModalItemTitle,
  Tooltip,
} from 'styles/common';
import { EXTERNAL_LINKS } from 'constants/links';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import WarningIcon from 'assets/svg/app/warning.svg';

const BuyHedgeTabOptimism = () => {
  const { t } = useTranslation();
  const { synthetixjs, walletAddress } = Connector.useContainer();
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

  const sUSDContract = synthetixjs?.contracts.SynthsUSD;
  const [amountToSend, setAmountToSend] = useState('');
  const [sendMax, setSendMax] = useState(false);
  const [approveGasCost, setApproveGasCost] = useState<GasPrice | undefined>(undefined);
  const [depositGasCost, setDepositGasCost] = useState<GasPrice | undefined>(undefined);

  const { useContractTxn, useSynthsBalancesQuery } = useSynthetixQueries();
  const dSNXTokenPriceQuery = useGetDSNXPrice(walletAddress);
  const dSNXPrice = dSNXTokenPriceQuery.data;
  const approveQuery = useGetNeedsApproval(
    dSNXPoolContractOptimism.address,
    sUSDContract,
    walletAddress
  );
  const approved = approveQuery.data;
  const approveTx = useContractTxn(
    sUSDContract!,
    'approve',
    [dSNXPoolContractOptimism.address, constants.MaxUint256],
    approveGasCost,
    {
      enabled: Boolean(walletAddress && sUSDContract),
      onSuccess: () => {
        setTxModalOpen(false);
        approveQuery.refetch();
      },
    }
  );

  const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
  const sUSDBalance = synthsBalancesQuery.data?.balancesMap.sUSD?.balance || wei(0);
  const dSNXBalanceQuery = useGetDSnxBalance();
  const dSNXBalance = dSNXBalanceQuery.data;
  const actualAmountToSendBn = sendMax ? sUSDBalance : wei(amountToSend || 0);
  const depositTx = useContractTxn(
    dSNXPoolContractOptimism,
    'deposit',
    [sUSDContract?.address, actualAmountToSendBn.toBN()],
    depositGasCost,
    {
      onSuccess: () => {
        setAmountToSend('');
        setTxModalOpen(false);
        dSNXBalanceQuery.refetch();
      },
      enabled: Boolean(approved && sUSDContract?.address),
    }
  );
  const dSnxAmount =
    actualAmountToSendBn.gt(0) && dSNXPrice
      ? formatCryptoCurrency(
          wei(actualAmountToSendBn).sub(actualAmountToSendBn.mul(SLIPPAGE)).div(dSNXPrice),
          {
            minDecimals: 3,
          }
        )
      : '';

  return (
    <Container>
      <StyledBackgroundTab>
        <StyledInputLabel>
          {t('debt.actions.manage.using')}
          <StyledCryptoCurrencyBox>
            <StyledCryptoCurrencyImage src="https://raw.githubusercontent.com/Synthetixio/synthetix-assets/v2.0.10/synths/sUSD.svg" />
            sUSD
          </StyledCryptoCurrencyBox>
        </StyledInputLabel>
        <InputWrapper>
          <StyledHedgeInput
            type="number"
            min={0}
            disabled={approveTx.isLoading || depositTx.isLoading}
            placeholder={formatCryptoCurrency(sUSDBalance, {
              minDecimals: 3,
            })}
            onChange={(e) => {
              try {
                const val = utils.parseUnits(e.target.value || '0', 18);
                if (val.gte(constants.MaxUint256)) return;
                setSendMax(false);
                setAmountToSend(e.target.value);
              } catch {}
            }}
            value={sendMax ? sUSDBalance.toString(2) : amountToSend}
            autoFocus={true}
          />
        </InputWrapper>
        <StyledBalance>
          {t('debt.actions.manage.balance-usd')}
          {formatCryptoCurrency(wei(sUSDBalance), {
            minDecimals: 3,
          })}
          <StyledMaxButton
            variant="text"
            isActive={sUSDBalance?.gt(0)}
            disabled={approveTx.isLoading || depositTx.isLoading}
            onClick={() => {
              if (sUSDBalance?.gt(0)) {
                setSendMax(true);
              }
            }}
          >
            {t('debt.actions.manage.max')}
          </StyledMaxButton>
        </StyledBalance>
        <StyledSpacer />
        <StyledInputLabel>
          {t('debt.actions.manage.buying')}
          <StyledCryptoCurrencyBox>
            <Dhedge width="24" />
            dSNX
          </StyledCryptoCurrencyBox>
        </StyledInputLabel>
        <Tooltip content={"This assumes a slippage of 1%, usually it's less than that"}>
          <InputWrapper>
            <StyledHedgeInput
              type="text"
              onChange={() => {}}
              disabled
              value={dSnxAmount ? `~${dSnxAmount}` : '~0'}
            />
          </InputWrapper>
        </Tooltip>
        <StyledBalance>
          {t('debt.actions.manage.balance')}
          {formatCryptoCurrency(dSNXBalance || wei(0), {
            minDecimals: 3,
          })}
        </StyledBalance>
        <GasSelector
          gasLimitEstimate={approved ? depositTx.gasLimit : approveTx.gasLimit}
          onGasPriceChange={approved ? setDepositGasCost : setApproveGasCost}
          optimismLayerOneFee={
            approved ? depositTx.optimismLayerOneFee : approveTx.optimismLayerOneFee
          }
          altVersion
        />
      </StyledBackgroundTab>
      {approveTx.isLoading && (
        <LoaderContainer>
          <LoaderIcon width="20" />
          <LoaderText>{t('debt.actions.manage.approving-dsnx')}</LoaderText>
        </LoaderContainer>
      )}
      {depositTx.isLoading && (
        <LoaderContainer>
          <LoaderIcon width="20" />
          <LoaderText>{t('debt.actions.manage.buying-dsnx')}</LoaderText>
        </LoaderContainer>
      )}
      {Boolean(!approveTx.isLoading && !depositTx.isLoading) && (
        <>
          {depositTx.errorMessage && (
            <ErrorText>
              <WarningIcon width="30" />
              {depositTx.errorMessage}
            </ErrorText>
          )}
          <StyledButton
            size="lg"
            onClick={() => {
              setTxModalOpen(true);
              approved ? depositTx.mutate() : approveTx.mutate();
            }}
            variant="primary"
            disabled={wei(actualAmountToSendBn || '0').eq(0) || Boolean(depositTx.errorMessage)}
          >
            {approved ? t('debt.actions.manage.swap') : t('debt.actions.manage.approve')}
          </StyledButton>
        </>
      )}
      <PoweredByContainer>
        {t('debt.actions.manage.powered-by')}{' '}
        <ExternalLink href={EXTERNAL_LINKS.Toros.dSNXPool}>
          <TorosLogo alt="toros logo" src={'/images/toros-white.png'} />
        </ExternalLink>
      </PoweredByContainer>
      {txModalOpen && (
        <TxConfirmationModal
          onDismiss={() => setTxModalOpen(false)}
          txError={approved ? depositTx.errorMessage : approveTx.errorMessage}
          attemptRetry={approved ? depositTx.mutate : approveTx.mutate}
          content={
            <ModalContent>
              <ModalItem>
                <ModalItemTitle>
                  {approved
                    ? t('debt.actions.manage.buying-dsnx')
                    : t('debt.actions.manage.approving-dsnx')}
                </ModalItemTitle>
                <ModalItemText>{dSNXPoolContractOptimism.address}</ModalItemText>
              </ModalItem>
            </ModalContent>
          }
        />
      )}
    </Container>
  );
};

export default BuyHedgeTabOptimism;

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const ErrorText = styled.p`
  color: white;
  text-transform: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  flex-direction: column;
`;
const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
`;
const LoaderText = styled.p`
  margin-left: 10px;
  text-transform: none;
`;
