import { useState } from 'react';
import { ethers } from 'ethers';
import { Loan } from 'containers/Loans/types';
import Wrapper from './Wrapper';
import { useRouter } from 'next/router';
import ROUTES from 'constants/routes';
import { SYNTH_DECIMALS } from 'constants/defaults';
import Connector from 'containers/Connector';
import { wei } from '@synthetixio/wei';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';

type RepayProps = {
  loanId: number;
  loan: Loan;
};

const Repay: React.FC<RepayProps> = ({ loan, loanId }) => {
  const router = useRouter();
  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
  const { walletAddress } = Connector.useContainer();
  const { useSynthetixTxn } = useSynthetixQueries();

  const [isWorking, setIsWorking] = useState<string>('');
  const [repayAmountString, setRepayAmount] = useState<string | null>(null);
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

  const debtAsset = loan.currency;

  const repayAmount = repayAmountString ? wei(repayAmountString) : wei(0);

  const remainingAmount = wei(loan.amount).sub(repayAmount.toBN());
  const remainingAmountString = remainingAmount.toString(1);
  const isRepayingFully = remainingAmount.eq(0);

  const onSetLeftColAmount = (amount: string) =>
    !amount
      ? setRepayAmount(null)
      : wei(amount).gt(loan.amount)
      ? onSetLeftColMaxAmount()
      : setRepayAmount(amount);
  const onSetLeftColMaxAmount = () =>
    setRepayAmount(ethers.utils.formatUnits(loan.amount, SYNTH_DECIMALS));

  const txn = useSynthetixTxn(
    'CollateralEth',
    'repay',
    [walletAddress, Number(loanId), repayAmount.toBN()],
    gasPrice,
    {
      enabled: !repayAmount.eq(0),
      onSuccess: () => {
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
  const repay = async () => {
    setIsWorking('repaying');
    setTxModalOpen(true);
    txn.mutate();
  };

  return (
    <Wrapper
      {...{
        gasLimit: txn.gasLimit,
        optimismLayerOneFee: txn.optimismLayerOneFee,
        onGasPriceChange: setGasPrice,
        loan,
        showCRatio: true,

        leftColLabel: 'loans.modify-loan.repay.left-col-label',
        leftColAssetName: debtAsset,
        leftColAmount: repayAmountString,
        onSetLeftColAmount,
        onSetLeftColMaxAmount,

        rightColLabel: 'loans.modify-loan.repay.right-col-label',
        rightColAssetName: debtAsset,
        rightColAmount: remainingAmountString,

        buttonLabel: `loans.modify-loan.repay.button-labels.${
          isWorking ? isWorking : isRepayingFully ? 'repaying-fully-error' : 'default'
        }`,
        buttonIsDisabled: !!isWorking || isRepayingFully,
        onButtonClick: repay,

        error: txn.errorMessage,

        txModalOpen,
        setTxModalOpen,
      }}
    />
  );
};

export default Repay;
