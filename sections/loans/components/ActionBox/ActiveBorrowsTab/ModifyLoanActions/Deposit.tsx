import { useState } from 'react';
import { ethers } from 'ethers';
import { wei } from '@synthetixio/wei';

import { Loan } from 'containers/Loans/types';
import Wrapper from './Wrapper';
import { useRouter } from 'next/router';
import ROUTES from 'constants/routes';
import { getETHToken } from 'contracts/ethToken';
import Connector from 'containers/Connector';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';

type DepositProps = {
  loanId: number;
  loan: Loan;
};

const Deposit: React.FC<DepositProps> = ({ loan, loanId }) => {
  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
  const { useSynthetixTxn } = useSynthetixQueries();
  const router = useRouter();
  const { walletAddress } = Connector.useContainer();

  const [isWorking, setIsWorking] = useState<string>('');
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

  const collateralAsset = 'ETH';
  const collateralDecimals = getETHToken().decimals;

  const [depositAmountString, setDepositalAmount] = useState<string | null>(null);

  const collateralAmount = wei(wei(loan.collateral), collateralDecimals);
  const depositAmount = depositAmountString ? wei(depositAmountString, collateralDecimals) : wei(0);

  const totalAmount = collateralAmount.add(depositAmount);
  const totalAmountString = ethers.utils.formatUnits(totalAmount.toBN(), collateralDecimals);

  const onSetLeftColAmount = (amount: string) =>
    !amount ? setDepositalAmount(null) : setDepositalAmount(amount);
  const onSetLeftColMaxAmount = (amount: string) => setDepositalAmount(amount);

  const depositTxn = useSynthetixTxn(
    'CollateralEth',
    'deposit',
    [walletAddress, loanId],
    { ...gasPrice, value: depositAmount.toBN() },
    {
      enabled: depositAmount.gt(0),
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

  const deposit = async () => {
    setIsWorking('depositing');
    setTxModalOpen(true);
    depositTxn.mutate();
  };

  return (
    <Wrapper
      {...{
        gasLimit: depositTxn.gasLimit,
        optimismLayerOneFee: depositTxn.optimismLayerOneFee,

        onGasPriceChange: setGasPrice,
        loan,
        showCRatio: true,

        leftColLabel: 'loans.modify-loan.deposit.left-col-label',
        leftColAssetName: collateralAsset,
        leftColAmount: depositAmountString,
        onSetLeftColAmount,
        onSetLeftColMaxAmount,

        rightColLabel: 'loans.modify-loan.deposit.right-col-label',
        rightColAssetName: collateralAsset,
        rightColAmount: totalAmountString,

        buttonLabel: `loans.modify-loan.deposit.button-labels.${isWorking ? isWorking : 'default'}`,
        buttonIsDisabled: !!isWorking || depositAmount.eq(0),
        onButtonClick: deposit,

        error: depositTxn.errorMessage,

        txModalOpen,
        setTxModalOpen,
      }}
    />
  );
};

export default Deposit;
