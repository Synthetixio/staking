import {
	FC,
	useCallback,
	// useEffect,
	useState,
	useMemo,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Notify from 'containers/Notify';
import {
	ModalItemTitle as TxModalItemTitle,
	ModalItemText as TxModalItemText,
} from 'styles/common';
import { TxModalItem } from 'sections/delegate/common';
import {
	tx,
	// getGasEstimateForTransaction
} from 'utils/transactions';
// import {
// 	normalizeGasLimit as getNormalizedGasLimit,
// 	normalizedGasPrice as getNormalizedGasPrice,
// } from 'utils/network';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { DelegateApproval } from 'queries/delegate/types';
import { useDelegates } from 'sections/delegate/contexts/delegates';
import { WITHDRAW_CONTRACT_METHODS } from 'queries/delegate/types';

type RevokeDelegateProps = {
	delegateApproval: DelegateApproval;
};

const RevokeDelegate: FC<RevokeDelegateProps> = ({ delegateApproval }) => {
	const { t } = useTranslation();
	const { monitorHash } = Notify.useContainer();
	const { delegateApprovalsContract, getActionByBytes } = useDelegates();

	const [, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [buttonState, setButtonState] = useState<string | null>(null);

	// const [gasPrice, setGasPrice] = useState<number>(0);
	// const [gasLimit, setGasLimitEstimate] = useState<number | null>(null);

	const shortenedDelegateAddress = useMemo(
		() => `${delegateApproval.delegate.slice(0, 8)}....${delegateApproval.delegate.slice(-6)}`,
		[delegateApproval.delegate]
	);

	const getWithdrawTxData = useCallback(
		(gas: Record<string, number>) => {
			const action = getActionByBytes(delegateApproval.action);
			if (!(delegateApprovalsContract && action)) return null;
			return [
				delegateApprovalsContract,
				WITHDRAW_CONTRACT_METHODS.get(action),
				[delegateApproval.delegate, gas],
			];
		},
		[
			delegateApprovalsContract,
			delegateApproval.delegate,
			delegateApproval.action,
			getActionByBytes,
		]
	);

	const withdrawApproval = async () => {
		setButtonState('withdrawing');
		setTxModalOpen(true);
		try {
			const gas: Record<string, number> = {
				// gasPrice: getNormalizedGasPrice(gasPrice),
				// gasLimit: gasLimit!,
			};
			await tx(() => getWithdrawTxData(gas), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) =>
					monitorHash({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
				showSuccessNotification: (hash: string) => {},
			});
		} catch {
		} finally {
			setButtonState(null);
			setTxModalOpen(false);
		}
	};

	// // gas
	// useEffect(() => {
	// 	let isMounted = true;
	// 	(async () => {
	// 		try {
	// 			setError(null);
	// 			const data: any[] | null = getWithdrawTxData({});
	// 			if (!data) return;
	// 			const [contract, method, args] = data;
	// 			const gasEstimate = await getGasEstimateForTransaction(args, contract.estimateGas[method]);
	// 			if (isMounted) setGasLimitEstimate(getNormalizedGasLimit(Number(gasEstimate)));
	// 		} catch (error) {
	// 			// console.error(error);
	// 			if (isMounted) setGasLimitEstimate(null);
	// 		}
	// 	})();
	// 	return () => {
	// 		isMounted = false;
	// 	};
	// }, [getWithdrawTxData]);

	return (
		<>
			<Container onClick={withdrawApproval}>
				{t(`delegate.list.withdraw-approval.button.${buttonState ?? 'default'}`)}
			</Container>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={null}
					attemptRetry={withdrawApproval}
					content={
						<TxModalItem>
							<TxModalItemTitle>
								{t('delegate.list.withdraw-approval.tx-confirmation-title')}
							</TxModalItemTitle>
							<TxModalItemText>{shortenedDelegateAddress}</TxModalItemText>
						</TxModalItem>
					}
				/>
			)}
		</>
	);
};

const Container = styled.div`
	text-align: right;
	color: ${(props) => props.theme.colors.pink};
	cursor: pointer;
	white-space: nowrap;
	text-transform: uppercase;
	font-weight: bold;
	font-size: 12px;
`;

export default RevokeDelegate;
