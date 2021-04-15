import {
	FC,
	useCallback,
	// useEffect,
	useState,
	useMemo,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import TransactionNotifier from 'containers/TransactionNotifier';
import {
	ModalItemTitle as TxModalItemTitle,
	ModalItemText as TxModalItemText,
} from 'styles/common';
import { truncateAddress } from 'utils/formatters/string';
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
import { Account, Action } from 'queries/delegate/types';
import Delegates from 'containers/Delegates';
import { APPROVE_CONTRACT_METHODS, WITHDRAW_CONTRACT_METHODS } from 'queries/delegate/types';

type ToggleDelegateApprovalProps = {
	account: Account;
	action: string;
	value: boolean;
};

const ToggleDelegateApproval: FC<ToggleDelegateApprovalProps> = ({
	account,
	action,
	value: checked,
}) => {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { delegateApprovalsContract } = Delegates.useContainer();

	const [, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	// const [gasPrice, setGasPrice] = useState<number>(0);
	// const [gasLimit, setGasLimitEstimate] = useState<number | null>(null);

	const shortenedDelegateAddress = useMemo(() => truncateAddress(account.delegate, 8, 6), [
		account.delegate,
	]);

	const getTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!delegateApprovalsContract) return null;
			const meths = checked ? WITHDRAW_CONTRACT_METHODS : APPROVE_CONTRACT_METHODS;
			return [delegateApprovalsContract, meths.get(action), [account.delegate, gas]];
		},
		[delegateApprovalsContract, account.delegate, action, checked]
	);

	const onChange = async () => {
		setTxModalOpen(true);
		try {
			const gas: Record<string, number> = {
				// gasPrice: getNormalizedGasPrice(gasPrice),
				// gasLimit: gasLimit!,
			};
			await tx(() => getTxData(gas), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) =>
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
				showSuccessNotification: (hash: string) => {},
			});
		} catch {
		} finally {
			setTxModalOpen(false);
		}
	};

	// // gas
	// useEffect(() => {
	// 	let isMounted = true;
	// 	(async () => {
	// 		try {
	// 			setError(null);
	// 			const data: any[] | null = getTxData({});
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
	// }, [getTxData]);

	return (
		<>
			<Container>
				<input
					name={action}
					data-testid={`checkbox-${account.delegate}-${t(
						`common.delegate-actions.actions.${action}`
					)}`}
					type="checkbox"
					disabled={account.all && action !== Action.APPROVE_ALL}
					{...{ onChange, checked }}
				/>
				<span className="checkmark"></span>
			</Container>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={null}
					attemptRetry={onChange}
					content={
						<TxModalItem>
							<TxModalItemTitle>{t('delegate.tx-confirmation-title')}</TxModalItemTitle>
							<TxModalItemText>{shortenedDelegateAddress}</TxModalItemText>
						</TxModalItem>
					}
				/>
			)}
		</>
	);
};

const Container = styled.label`
	display: block;
	position: relative;
	padding-left: 45px;
	margin-bottom: 12px;
	cursor: pointer;
	font-size: 22px;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;

	input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
	}

	.checkmark {
		position: absolute;
		top: 0;
		left: 0;
		height: 16px;
		width: 16px;
		border: 1px solid ${(props) => props.theme.colors.mediumBlueHover};
		border-radius: 1px;
		background-color: ${(props) => props.theme.colors.mediumBlue};
		color: ${(props) => props.theme.colors.blue};
		opacity: 0.8;
	}

	&:hover input ~ .checkmark {
		opacity: 1;
	}

	input:disabled ~ .checkmark {
		opacity: 0.2;
	}

	.checkmark:after {
		content: '';
		position: absolute;
		display: none;
	}

	input:checked ~ .checkmark:after {
		display: block;
	}

	.checkmark:after {
		left: 4px;
		top: 2px;
		width: 3px;
		height: 6px;
		border: solid ${(props) => props.theme.colors.blue};
		border-width: 0 2px 2px 0;
		-webkit-transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		transform: rotate(45deg);
	}
`;

export default ToggleDelegateApproval;
