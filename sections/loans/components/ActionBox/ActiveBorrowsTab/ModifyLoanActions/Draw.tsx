import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { Loan } from 'containers/Loans/types';
import TransactionNotifier from 'containers/TransactionNotifier';
import { tx } from 'utils/transactions';
import Wrapper from './Wrapper';
import useSynthetixQueries from '@synthetixio/queries';
import { calculateLoanCRatio } from '../../BorrowSynthsTab/calculateLoanCRatio';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { calculateMaxDraw, getSafeCratio } from './helpers';
import { wei } from '@synthetixio/wei';
import ROUTES from 'constants/routes';
import { SYNTH_DECIMALS } from 'constants/defaults';

type DrawProps = {
	loanId: number;
	loanTypeIsETH: boolean;
	loan: Loan;
	loanContract: ethers.Contract;
};

const Draw: React.FC<DrawProps> = ({ loan, loanId, loanTypeIsETH, loanContract }) => {
	const router = useRouter();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { t } = useTranslation();
	const [isWorking, setIsWorking] = useState<string>('');
	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [drawAmountString, setDrawAmount] = useState<string | null>(null);
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;

	const debtAsset = loan.currency;
	const drawAmount = drawAmountString ? wei(drawAmountString) : wei(0);
	const loanAmountWei = wei(loan.amount);
	const newTotalAmount = loanAmountWei.add(drawAmount);
	const newTotalAmountString = ethers.utils.formatUnits(newTotalAmount.toBN(), SYNTH_DECIMALS);
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

	const getTxData = useCallback(() => {
		if (!(loanContract && !drawAmount.eq(0))) return null;

		return [loanContract, 'draw', [loanId, drawAmount.toBN()]];
	}, [loanContract, loanId, drawAmount]);

	const draw = async () => {
		try {
			setIsWorking('drawing');
			setTxModalOpen(true);
			await tx(() => getTxData(), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) =>
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
			});
			setIsWorking('');
			setTxModalOpen(false);
			router.push(ROUTES.Loans.List);
		} catch {
			setIsWorking('');
			setTxModalOpen(false);
		}
	};

	return (
		<Wrapper
			{...{
				getTxData,

				loan,
				loanTypeIsETH,
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

				error: error ? error : maxDrawUsd.eq(0) ? t('loans.modify-loan.draw.low-collateral') : null,
				setError,

				txModalOpen,
				setTxModalOpen,
			}}
		/>
	);
};

export default Draw;
