import { FC, useCallback, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

import TransactionNotifier from 'containers/TransactionNotifier';
import {
	ModalItemTitle as TxModalItemTitle,
	ModalItemText as TxModalItemText,
} from 'styles/common';
import { truncateAddress } from 'utils/formatters/string';
import { TxModalItem } from 'sections/delegate/common';
import { tx } from 'utils/transactions';

import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import { appReadyState } from 'store/app';
import {
	Action,
	DELEGATE_APPROVE_CONTRACT_METHODS,
	DelegationWallet,
	DELEGATE_WITHDRAW_CONTRACT_METHODS,
} from '@synthetixio/queries';
import Connector from 'containers/Connector';

type ToggleDelegateApprovalProps = {
	account: DelegationWallet;
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
	const isAppReady = useRecoilValue(appReadyState);
	const { synthetixjs } = Connector.useContainer();

	const [, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const shortenedDelegateAddress = useMemo(() => truncateAddress(account.address, 8, 6), [
		account.address,
	]);

	const getTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!isAppReady) return null;
			const {
				contracts: { DelegateApprovals },
			} = synthetixjs!;
			const meths = checked
				? DELEGATE_WITHDRAW_CONTRACT_METHODS
				: DELEGATE_APPROVE_CONTRACT_METHODS;
			return [DelegateApprovals, meths.get(action), [account.address, gas]];
		},
		[isAppReady, account.address, action, checked, synthetixjs]
	);

	const onChange = async () => {
		setTxModalOpen(true);
		try {
			const gas: Record<string, number> = {};
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

	const canAll = (account: DelegationWallet) =>
		account.canBurn && account.canMint && account.canClaim && account.canExchange;

	return (
		<>
			<Container>
				<input
					name={action}
					data-testid={`checkbox-${account.address}-${t(
						`common.delegate-actions.actions.${action}`
					)}`}
					type="checkbox"
					disabled={canAll(account) && action !== Action.APPROVE_ALL}
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
