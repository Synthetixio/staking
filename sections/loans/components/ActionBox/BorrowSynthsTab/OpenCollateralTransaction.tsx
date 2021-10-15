import useSynthetixQueries, { SynthetixQueries } from '@synthetixio/queries';
import Wei from '@synthetixio/wei';
import { ethers } from 'ethers';
import { FC, useEffect } from 'react';

/**
 * This component exists so that we can call useSynthetixTxn conditionally, ie. we can just not render this component if we not ready to fire off the open transaction.
 * Before when this was called directly we got into a error loop where since the Load Contract revert the transaction when we were missing input
 */

export type OpenTransactionType = ReturnType<SynthetixQueries['useSynthetixTxn']>;
const OpenCollateralTransaction: FC<{
	collateral: { amount: Wei; asset: string };
	debt: { amount: Wei; asset: string };
	collateralIsETH: boolean;
	gasPrice: Wei;
	txModalOpen: boolean;
	setTxModalOpen: (modalOpen: boolean) => void;
	setOpenTransaction: (openTxn: OpenTransactionType) => void;
	openTxn: OpenTransactionType | null;
}> = (props) => {
	const { debt, collateral, collateralIsETH, gasPrice, setOpenTransaction } = props;

	const { useSynthetixTxn } = useSynthetixQueries();

	const openTxn = useSynthetixTxn(
		collateralIsETH ? 'CollateralEth' : 'CollateralErc20',
		'open',
		collateralIsETH
			? [debt.amount.toBN(), ethers.utils.formatBytes32String(debt.asset)]
			: [
					collateral.amount.toBN(),
					debt.amount.toBN(),
					ethers.utils.formatBytes32String(debt.asset),
			  ],
		{ gasPrice: gasPrice.toBN(), value: collateralIsETH ? collateral.amount.toBN() : 0 }
	);
	useEffect(() => {
		if (!props.openTxn || props.openTxn.txnStatus !== openTxn.txnStatus) {
			setOpenTransaction(openTxn);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openTxn.txnStatus]); // Only run this effect when transaction status changes

	return null;
};

export default OpenCollateralTransaction;
