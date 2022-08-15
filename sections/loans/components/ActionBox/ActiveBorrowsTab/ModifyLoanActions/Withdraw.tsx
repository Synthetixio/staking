import { useState } from 'react';
import { ethers } from 'ethers';
import { Loan } from 'containers/Loans/types';
import Loans from 'containers/Loans';
import Wrapper from './Wrapper';
import { useRouter } from 'next/router';
import ROUTES from 'constants/routes';
import { getETHToken } from 'contracts/ethToken';
import { wei } from '@synthetixio/wei';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';

type WithdrawProps = {
  loanId: number;
  loan: Loan;
};

const Withdraw: React.FC<WithdrawProps> = ({ loan, loanId }) => {
  const router = useRouter();
  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
  const { useSynthetixTxn } = useSynthetixQueries();

  const { reloadPendingWithdrawals } = Loans.useContainer();

  const [isWorking, setIsWorking] = useState<string>('');
  const [withdrawalAmountString, setWithdrawalAmount] = useState<string | null>(null);
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

  const collateralAsset = 'ETH';
  const collateralDecimals = getETHToken().decimals;

  const collateralAmount = wei(wei(loan.collateral), collateralDecimals);
  const withdrawalAmount = withdrawalAmountString
    ? wei(withdrawalAmountString, collateralDecimals)
    : wei(0);

  const remainingAmount = collateralAmount.sub(withdrawalAmount);
  const remainingAmountString = ethers.utils.formatUnits(
    remainingAmount.toBN(),
    collateralDecimals
  );

  const onSetLeftColAmount = (amount: string) => {
    !amount
      ? setWithdrawalAmount(null)
      : wei(amount, collateralDecimals).gt(collateralAmount)
      ? onSetLeftColMaxAmount()
      : setWithdrawalAmount(amount);
  };
  const onSetLeftColMaxAmount = () =>
    setWithdrawalAmount(ethers.utils.formatUnits(collateralAmount.toBN(), collateralDecimals));

  const txn = useSynthetixTxn(
    'CollateralEth',
    'withdraw',
    [loanId, withdrawalAmount.toBN()],
    gasPrice,
    {
      enabled: !withdrawalAmount.eq(0),
      onSuccess: async () => {
        await reloadPendingWithdrawals();
        setIsWorking('');
        setTxModalOpen(false);
        router.push(ROUTES.Loans.List);
      },
      onError: () => {
        setIsWorking('');
        setTxModalOpen(false);
      },
    }
  );
  const withdraw = async () => {
    setIsWorking('withdrawing');
    setTxModalOpen(true);
    txn.mutate();
  };

  return (
    <Wrapper
      {...{
        onGasPriceChange: setGasPrice,
        gasLimit: txn.gasLimit,
        optimismLayerOneFee: txn.optimismLayerOneFee,

        loan,
        showCRatio: true,

        leftColLabel: 'loans.modify-loan.withdraw.left-col-label',
        leftColAssetName: collateralAsset,
        leftColAmount: withdrawalAmountString,
        onSetLeftColAmount,
        onSetLeftColMaxAmount,

        rightColLabel: 'loans.modify-loan.withdraw.right-col-label',
        rightColAssetName: collateralAsset,
        rightColAmount: remainingAmountString,

        buttonLabel: `loans.modify-loan.withdraw.button-labels.${
          isWorking ? isWorking : 'default'
        }`,
        buttonIsDisabled: !!isWorking,
        onButtonClick: withdraw,

        error: txn.errorMessage,

        txModalOpen,
        setTxModalOpen,
      }}
    />
  );
};

export default Withdraw;
