import { useState } from 'react';
import { useRouter } from 'next/router';

import { Loan } from 'containers/Loans/types';
import Loans from 'containers/Loans';
import Wrapper from './Wrapper';
import ROUTES from 'constants/routes';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';

type CloseProps = {
  loanId: number;
  loan: Loan;
};

const Close: React.FC<CloseProps> = ({ loan, loanId }) => {
  const router = useRouter();
  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
  const { useSynthetixTxn } = useSynthetixQueries();
  const { reloadPendingWithdrawals } = Loans.useContainer();

  const [isWorking, setIsWorking] = useState<string>('');
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

  const txn = useSynthetixTxn('CollateralEth', 'close', [loanId], gasPrice, {
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
    enabled: true,
  });
  const close = () => {
    setIsWorking('closing');
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
        showInterestAccrued: true,

        leftColLabel: 'loans.modify-loan.close.left-col-label',
        leftColAssetName: loan.currency,
        leftColAmount: wei(loan.amount).toString(1),

        rightColLabel: 'loans.modify-loan.close.right-col-label',
        rightColAssetName: 'ETH',
        rightColAmount: wei(loan.collateral).toString(1),

        buttonLabel: `loans.modify-loan.close.button-labels.${isWorking ? isWorking : 'default'}`,
        buttonIsDisabled: !!isWorking,
        onButtonClick: close,

        error: txn.errorMessage,

        txModalOpen,
        setTxModalOpen,
      }}
    />
  );
};

export default Close;
