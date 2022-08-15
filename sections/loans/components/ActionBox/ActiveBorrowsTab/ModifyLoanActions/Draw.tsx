import { useState } from 'react';
import { Loan } from 'containers/Loans/types';
import Wrapper from './Wrapper';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { calculateMaxDraw } from './helpers';
import { wei } from '@synthetixio/wei';
import ROUTES from 'constants/routes';

type DrawProps = {
  loanId: number;
  loan: Loan;
};

const Draw: React.FC<DrawProps> = ({ loan, loanId }) => {
  const router = useRouter();
  const { useSynthetixTxn } = useSynthetixQueries();

  const { t } = useTranslation();
  const [isWorking, setIsWorking] = useState<string>('');
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);

  const [drawAmountString, setDrawAmount] = useState<string | null>(null);
  const { useExchangeRatesQuery } = useSynthetixQueries();
  const exchangeRatesQuery = useExchangeRatesQuery();
  const exchangeRates = exchangeRatesQuery.data ?? null;

  const debtAsset = loan.currency;
  const drawAmount = drawAmountString ? wei(drawAmountString) : wei(0);
  const loanAmountWei = wei(loan.amount);
  const newTotalAmount = loanAmountWei.add(drawAmount);
  const newTotalAmountString = newTotalAmount.toString(1);
  const maxDrawUsd = calculateMaxDraw(loan, exchangeRates);

  const onSetLeftColAmount = (amount: string) => {
    if (!amount) {
      setDrawAmount(null);
      return;
    }

    if (wei(amount).gte(maxDrawUsd)) {
      onSetLeftColMaxAmount();
      return;
    }
    return setDrawAmount(amount);
  };
  const onSetLeftColMaxAmount = () => {
    setDrawAmount(maxDrawUsd.toString(2));
  };

  const txn = useSynthetixTxn('CollateralEth', 'draw', [loanId, drawAmount.toBN()], gasPrice, {
    enabled: !drawAmount.eq(0),
    onSuccess: () => {
      setIsWorking('');
      setTxModalOpen(false);
      router.push(ROUTES.Loans.List);
    },
    onError: () => {
      setIsWorking('');
      setTxModalOpen(false);
    },
  });
  const draw = async () => {
    setIsWorking('drawing');
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

        leftColLabel: 'loans.modify-loan.draw.left-col-label',
        leftColAssetName: debtAsset,
        leftColAmount: drawAmountString,
        onSetLeftColAmount: maxDrawUsd.eq(0) ? undefined : onSetLeftColAmount,
        onSetLeftColMaxAmount: maxDrawUsd.eq(0) ? undefined : onSetLeftColMaxAmount,

        rightColLabel: 'loans.modify-loan.draw.right-col-label',
        rightColAssetName: debtAsset,
        rightColAmount: newTotalAmountString,

        buttonLabel: `loans.modify-loan.draw.button-labels.${isWorking ? isWorking : 'default'}`,
        buttonIsDisabled: Boolean(isWorking) || maxDrawUsd.eq(0),
        onButtonClick: draw,

        error: txn.errorMessage
          ? txn.errorMessage
          : maxDrawUsd.eq(0)
          ? t('loans.modify-loan.draw.low-collateral')
          : null,

        txModalOpen,
        setTxModalOpen,
      }}
    />
  );
};

export default Draw;
