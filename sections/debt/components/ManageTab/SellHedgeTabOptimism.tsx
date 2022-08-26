import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import Connector from 'containers/Connector';
import { constants, utils } from 'ethers';
import useGetDSnxBalance from 'hooks/useGetDSnxBalance';
import useGetNeedsApproval from 'hooks/useGetNeedsApproval';
import { useState } from 'react';
import styled from 'styled-components';
import {
  ExternalLink,
  FlexDivColCentered,
  ModalContent,
  ModalItem,
  ModalItemText,
  ModalItemTitle,
  Tooltip,
} from 'styles/common';
import { formatCryptoCurrency } from 'utils/formatters/number';
import Dhedge from 'assets/svg/app/dhedge.svg';
import LoaderIcon from 'assets/svg/app/loader.svg';
import WarningIcon from 'assets/svg/app/warning.svg';
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
import {
  dSNXWrapperSwapperContractOptimism,
  dSNXPoolAddressOptimism,
  dSNXPoolContractOptimism,
  SLIPPAGE,
} from 'constants/dhedge';
import useGetDSNXPrice from 'hooks/useGetDSNXPrice';
import GasSelector from 'components/GasSelector';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { EXTERNAL_LINKS } from 'constants/links';
import { useTranslation } from 'react-i18next';

export default function SellHedgeTabOptimism() {
  const { useContractTxn, useSynthsBalancesQuery } = useSynthetixQueries();
  const { t } = useTranslation();

  const [approveGasCost, setApproveGasCost] = useState<GasPrice | undefined>(undefined);
  const [withdrawnGasCost, setWithdrawGasCost] = useState<GasPrice | undefined>(undefined);
  const [amountToSend, setAmountToSend] = useState('');
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
  const [sendMax, setSendMax] = useState<boolean>(false);
  const { walletAddress, signer } = Connector.useContainer();
  const approveQuery = useGetNeedsApproval(
    dSNXWrapperSwapperContractOptimism.address,
    dSNXPoolContractOptimism,
    walletAddress
  );
  const dSNXTokenPriceQuery = useGetDSNXPrice(walletAddress);
  const dSNXPrice = dSNXTokenPriceQuery.data;
  const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
  const sUSDBalance = synthsBalancesQuery.data?.balancesMap.sUSD?.balance || wei(0);
  const dSNXBalanceQuery = useGetDSnxBalance();
  const actualAmountToSendBn = sendMax
    ? dSNXBalanceQuery.data?.toBN() || wei(0).toBN()
    : wei(amountToSend || 0).toBN();

  const dollarAmountToReceive =
    actualAmountToSendBn.gt(0) && dSNXPrice ? wei(actualAmountToSendBn).mul(dSNXPrice) : wei(0);
  const sUSDToReceiveWei = dollarAmountToReceive.sub(dollarAmountToReceive.mul(SLIPPAGE));
  const sUSDAmountToReceive = sUSDToReceiveWei.gt(0)
    ? formatCryptoCurrency(sUSDToReceiveWei, {
        minDecimals: 3,
      })
    : '0';
  const approveTx = useContractTxn(
    dSNXPoolContractOptimism.connect(signer!),
    'approve',
    [dSNXWrapperSwapperContractOptimism.address, constants.MaxUint256],
    approveGasCost,
    {
      enabled: Boolean(walletAddress && dSNXWrapperSwapperContractOptimism),
      onSuccess: () => {
        setTxModalOpen(false);
        approveQuery.refetch();
      },
    }
  );
  const withdrawTx = useContractTxn(
    dSNXWrapperSwapperContractOptimism.connect(signer!),
    'withdrawSUSD',
    [
      dSNXPoolAddressOptimism,
      actualAmountToSendBn,
      '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      actualAmountToSendBn.div(dSNXPrice?.toBN() || wei(1).toBN()),
    ],
    withdrawnGasCost,
    {
      onSuccess: () => {
        setAmountToSend('');
        setTxModalOpen(false);
        dSNXBalanceQuery.refetch();
      },
      enabled: Boolean(approveQuery.data) && actualAmountToSendBn.gt(0),
    }
  );

  return (
    <StyledSellHedgeContainer>
      <StyledBackgroundTab>
        <StyledInputLabel>
          Using
          <StyledCryptoCurrencyBox>
            <Dhedge width="24" />
            dSNX
          </StyledCryptoCurrencyBox>
        </StyledInputLabel>
        <InputWrapper>
          <StyledHedgeInput
            type="number"
            min={0}
            disabled={approveTx.isLoading || withdrawTx.isLoading}
            placeholder={formatCryptoCurrency(dSNXBalanceQuery.data || wei(0), {
              minDecimals: 3,
            })}
            onChange={(e) => {
              try {
                const val = utils.parseUnits(e.target.value || '0', 18);
                if (val.gte(constants.MaxUint256)) return;
                setSendMax(false);
                setAmountToSend(e.target.value);
              } catch {
                console.error('Error while parsing input amount');
              }
            }}
            value={sendMax ? dSNXBalanceQuery.data?.toString(2) || '0' : amountToSend}
            autoFocus={true}
          />
        </InputWrapper>
        <StyledBalance>
          Balance:&nbsp;
          {formatCryptoCurrency(wei(dSNXBalanceQuery.data || wei(0)), {
            minDecimals: 3,
          })}
          <StyledMaxButton
            variant="text"
            isActive={dSNXBalanceQuery.data?.gt(0)}
            disabled={approveTx.isLoading || withdrawTx.isLoading}
            onClick={() => {
              if (dSNXBalanceQuery.data?.gt(0)) {
                setSendMax(true);
              }
            }}
          >
            MAX
          </StyledMaxButton>
        </StyledBalance>
        <StyledSpacer />
        <StyledInputLabel>
          Buying
          <StyledCryptoCurrencyBox>
            <StyledCryptoCurrencyImage src="https://raw.githubusercontent.com/Synthetixio/synthetix-assets/v2.0.10/synths/sUSD.svg" />
            sUSD
          </StyledCryptoCurrencyBox>
        </StyledInputLabel>
        <Tooltip content={"This assumes a slippage of 1%, usually it's less than that"}>
          <InputWrapper>
            <StyledHedgeInput
              style={{ margin: 0 }}
              type="text"
              onChange={() => {}}
              disabled
              value={sUSDAmountToReceive ? `~${sUSDAmountToReceive}` : '0'}
            />
          </InputWrapper>
        </Tooltip>

        <StyledBalance>
          Balance:&nbsp;
          {formatCryptoCurrency(sUSDBalance, {
            minDecimals: 3,
          })}
        </StyledBalance>
        <GasSelector
          gasLimitEstimate={approveQuery.data ? withdrawTx.gasLimit : approveTx.gasLimit}
          onGasPriceChange={approveQuery.data ? setWithdrawGasCost : setApproveGasCost}
          optimismLayerOneFee={
            approveQuery.data ? withdrawTx.optimismLayerOneFee : approveTx.optimismLayerOneFee
          }
          altVersion
        />
      </StyledBackgroundTab>
      {approveTx.isLoading && (
        <LoaderContainer>
          <LoaderIcon width="20" />
          <LoaderText>Approving dSNX</LoaderText>
        </LoaderContainer>
      )}
      {withdrawTx.isLoading && (
        <LoaderContainer>
          <LoaderIcon width="20" />
          <LoaderText>Selling dSNX for sUSD</LoaderText>
        </LoaderContainer>
      )}
      {Boolean(!approveTx.isLoading && !withdrawTx.isLoading) && (
        <>
          {withdrawTx.errorMessage && (
            <ErrorText>
              <WarningIcon width="30" />
              {withdrawTx.errorMessage}
            </ErrorText>
          )}
          <StyledButton
            size="lg"
            onClick={() => {
              setTxModalOpen(true);
              approveQuery.data ? withdrawTx.mutate() : approveTx.mutate();
            }}
            variant="primary"
            disabled={wei(actualAmountToSendBn || '0').eq(0) || Boolean(withdrawTx.errorMessage)}
          >
            {approveQuery.data ? 'Swap' : 'Approve'}
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
          txError={approveQuery.data ? withdrawTx.errorMessage : approveTx.errorMessage}
          attemptRetry={approveQuery.data ? withdrawTx.mutate : approveTx.mutate}
          content={
            <ModalContent>
              <ModalItem>
                <ModalItemTitle>
                  {approveQuery.data ? 'Selling dSNX for sUSD' : 'Approving dSNX'}
                </ModalItemTitle>
                <ModalItemText>{dSNXPoolContractOptimism.address}</ModalItemText>
              </ModalItem>
            </ModalContent>
          }
        />
      )}
    </StyledSellHedgeContainer>
  );
}
const StyledSellHedgeContainer = styled(FlexDivColCentered)`
  width: 100%;
  min-height: 100%;
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
