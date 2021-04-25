import { useState, useMemo, useEffect, FC, useCallback } from 'react';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { truncateAddress } from 'utils/formatters/string';
import { Trans, useTranslation } from 'react-i18next';
import Button from 'components/Button';
import StructuredTab from 'components/StructuredTab';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import {
	ModalItemTitle as TxModalItemTitle,
	ModalItemText as TxModalItemText,
	NoTextTransform,
	IconButton,
	FlexDivRowCentered,
} from 'styles/common';
import { Svg } from 'react-optimized-image';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import GasSelector from 'components/GasSelector';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import {
	Action,
	APPROVE_CONTRACT_METHODS,
	GET_IS_APPROVED_CONTRACT_METHODS,
} from 'queries/delegate/types';
import {
	FormContainer,
	InputsContainer,
	SettingsContainer,
	SettingContainer,
	ErrorMessage,
	TxModalItem,
} from 'sections/delegate/common';
import { tx, getGasEstimateForTransaction } from 'utils/transactions';
import {
	normalizeGasLimit as getNormalizedGasLimit,
	normalizedGasPrice as getNormalizedGasPrice,
} from 'utils/network';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import Delegates from 'containers/Delegates';
import ActionSelector from './ActionSelector';

const LeftCol: FC = () => {
	const { t } = useTranslation();

	const tabData = useMemo(
		() => [
			{
				title: t('delegate.form.title'),
				tabChildren: <Tab />,
				key: 'main',
				blue: true,
			},
		],
		[t]
	);

	return (
		<StructuredTab singleTab={true} boxPadding={20} tabData={tabData} setPanelType={() => null} />
	);
};

const Tab: FC = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const { connectWallet } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const address = useRecoilValue(walletAddressState);
	const { delegateApprovalsContract } = Delegates.useContainer();
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const [action, setAction] = useState<string>(Action.APPROVE_ALL);

	const [gasPrice, setGasPrice] = useState<number>(0);
	const [gasLimit, setGasLimitEstimate] = useState<number | null>(null);
	const [delegateAddress, setDelegateAddress] = useState<string>('');

	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [buttonState, setButtonState] = useState<string | null>(null);
	const [alreadyDelegated, setAlreadyDelegated] = useState<boolean>(false);

	const properDelegateAddress = useMemo(
		() => (delegateAddress && ethers.utils.isAddress(delegateAddress) ? delegateAddress : null),
		[delegateAddress]
	);
	const delegateAddressIsSelf = useMemo(
		() =>
			properDelegateAddress && address
				? properDelegateAddress === ethers.utils.getAddress(address)
				: null,
		[properDelegateAddress, address]
	);
	const shortenedDelegateAddress = useMemo(() => truncateAddress(delegateAddress, 8, 6), [
		delegateAddress,
	]);

	const getApproveTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!(delegateApprovalsContract && properDelegateAddress && !delegateAddressIsSelf))
				return null;
			return [
				delegateApprovalsContract,
				APPROVE_CONTRACT_METHODS.get(action),
				[properDelegateAddress, gas],
			];
		},
		[delegateApprovalsContract, properDelegateAddress, action, delegateAddressIsSelf]
	);

	const onGoBack = () => router.back();
	const onEnterAddress = (e: any) => setDelegateAddress((e.target.value ?? '').trim());
	const onButtonClick = async () => {
		if (!isWalletConnected) {
			return connectWallet();
		}
		delegate();
	};

	const delegate = async () => {
		setButtonState('delegating');
		setTxModalOpen(true);
		try {
			const gas: Record<string, number> = {
				gasPrice: getNormalizedGasPrice(gasPrice),
				gasLimit: gasLimit!,
			};
			await tx(() => getApproveTxData(gas), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) =>
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
				showSuccessNotification: (hash: string) => {},
			});
			setDelegateAddress('');
			setAction(Action.APPROVE_ALL);
		} catch {
		} finally {
			setButtonState(null);
			setTxModalOpen(false);
		}
	};

	// gas
	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				setError(null);
				const data: any[] | null = getApproveTxData({});
				if (!data) return;
				const [contract, method, args] = data;
				const gasEstimate = await getGasEstimateForTransaction(args, contract.estimateGas[method]);
				if (isMounted) setGasLimitEstimate(getNormalizedGasLimit(Number(gasEstimate)));
			} catch (error) {
				// console.error(error);
				if (isMounted) setGasLimitEstimate(null);
			}
		})();
		return () => {
			isMounted = false;
		};
	}, [getApproveTxData]);

	// already delegated
	useEffect(() => {
		if (!delegateApprovalsContract) return;
		let isMounted = true;
		(async () => {
			if (!(properDelegateAddress && action)) return setAlreadyDelegated(false);
			const alreadyDelegated = await delegateApprovalsContract[
				GET_IS_APPROVED_CONTRACT_METHODS.get(action)!
			](address, properDelegateAddress);
			if (isMounted) setAlreadyDelegated(alreadyDelegated);
		})();
		return () => {
			isMounted = false;
		};
	}, [delegateApprovalsContract, properDelegateAddress, address, action]);

	return (
		<div data-testid="form">
			<FormContainer>
				<Header>
					<IconButton onClick={onGoBack}>
						<Svg src={NavigationBack} />
					</IconButton>
				</Header>

				<InputsContainer>
					<AmountInput
						value={delegateAddress}
						placeholder={t('delegate.form.input-placeholder')}
						onChange={onEnterAddress}
						disabled={false}
						rows={3}
						autoComplete={'off'}
						spellCheck={false}
						data-testid="form-input"
					/>
				</InputsContainer>

				<SettingsContainer>
					<ActionSelector {...{ action, setAction }} />

					<SettingContainer>
						<GasSelector gasLimitEstimate={gasLimit} setGasPrice={setGasPrice} />
					</SettingContainer>
				</SettingsContainer>
			</FormContainer>

			<FormButton
				onClick={onButtonClick}
				variant="primary"
				size="lg"
				data-testid="form-button"
				disabled={
					isWalletConnected &&
					(!properDelegateAddress || !!buttonState || delegateAddressIsSelf || alreadyDelegated)
				}
			>
				{!isWalletConnected ? (
					t('common.wallet.connect-wallet')
				) : (
					<Trans
						i18nKey={`delegate.form.button-labels.${
							buttonState ||
							(!delegateAddress
								? 'enter-address'
								: delegateAddressIsSelf
								? 'cannot-delegate-to-self'
								: alreadyDelegated
								? 'already-delegated'
								: 'delegate')
						}`}
						components={[<NoTextTransform />]}
					/>
				)}
			</FormButton>

			{!error ? null : <ErrorMessage>{error}</ErrorMessage>}

			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={null}
					attemptRetry={onButtonClick}
					content={
						<TxModalItem>
							<TxModalItemTitle>{t('delegate.form.tx-confirmation-title')}</TxModalItemTitle>
							<TxModalItemText>{shortenedDelegateAddress}</TxModalItemText>
						</TxModalItem>
					}
				/>
			)}
		</div>
	);
};

const Header = styled(FlexDivRowCentered)`
	justify-content: space-between;
	width: 100%;
	padding: 8px;
`;

const AmountInput = styled.textarea`
	padding: 0;
	font-size: 24px;
	background: transparent;
	font-family: ${(props) => props.theme.fonts.extended};
	text-align: center;
	margin-top: 15px;
	overflow: hidden;
	resize: none;
	color: white;
	border: none;
	outline: none;

	&:disabled {
		color: ${(props) => props.theme.colors.gray};
	}
`;

const FormButton = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border-radius: 4px;
	width: 100%;
	text-transform: uppercase;
`;

export default LeftCol;
