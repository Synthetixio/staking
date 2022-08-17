import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import Connector from 'containers/Connector';
import { constants, utils } from 'ethers';
import useGetDSnxBalance from 'hooks/useGetDSnxBalance';
import useGetNeedsApproval from 'hooks/useGetNeedsApproval';
import { useState } from 'react';
import styled from 'styled-components';
import {
  FlexDivColCentered,
  ModalContent,
  ModalItem,
  ModalItemText,
  ModalItemTitle,
} from 'styles/common';
import { formatCryptoCurrency } from 'utils/formatters/number';
import Dhedge from 'assets/svg/app/dhedge.svg';
import LoaderIcon from 'assets/svg/app/loader.svg';
import WarningIcon from 'assets/svg/app/warning.svg';
import {
  StyledBackgroundTab,
  StyledBalance,
  StyledButton,
  StyledCryptoCurrencyBox,
  StyledCryptoCurrencyImage,
  StyledHedgeInput,
  StyledInputLabel,
  StyledMaxButton,
  StyledSpacer,
} from './hedge-tab-ui-components';
import {
  dSNXWrapperSwapperContractOptimism,
  dSNXPoolAddressOptimism,
  dSNXPoolContractOptimism,
} from 'constants/dhedge';
import useGetDSNXPrice from 'hooks/useGetDSNXPrice';
import GasSelector from 'components/GasSelector';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

export default function SellHedgeTabOptimism() {
  const { useContractTxn, useSynthsBalancesQuery } = useSynthetixQueries();
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
  const dSnxAmount =
    actualAmountToSendBn.gt(0) && dSNXPrice
      ? formatCryptoCurrency(wei(actualAmountToSendBn).div(dSNXPrice), {
          maxDecimals: 1,
          minDecimals: 2,
        })
      : '';
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
      actualAmountToSendBn.div(dSNXPrice?.toBN() || wei(0).toBN()),
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
        <StyledHedgeInput
          type="number"
          min={0}
          disabled={approveTx.isLoading || withdrawTx.isLoading}
          placeholder={formatCryptoCurrency(dSNXBalanceQuery.data || wei(0), {
            maxDecimals: 1,
            minDecimals: 2,
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
        <StyledBalance>
          Balance:&nbsp;
          {formatCryptoCurrency(wei(dSNXBalanceQuery.data || wei(0)), {
            maxDecimals: 1,
            minDecimals: 2,
          })}
          <StyledMaxButton
            variant="text"
            isActive={dSNXBalanceQuery.data?.gt(0)}
            disabled={approveTx.isLoading || withdrawTx.isLoading}
            onClick={() => {
              if (sUSDBalance?.gt(0)) {
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
        <StyledHedgeInput
          type="text"
          onChange={() => {}}
          disabled
          value={dSnxAmount ? `~${dSnxAmount}` : ''}
        />
        <StyledBalance>
          Balance:&nbsp;
          {formatCryptoCurrency(sUSDBalance, {
            maxDecimals: 1,
            minDecimals: 2,
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
