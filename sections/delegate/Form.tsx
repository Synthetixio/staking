import { useState, useMemo, useEffect, FC, useCallback } from 'react';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';

import synthetix from 'lib/synthetix';

import { truncateAddress } from 'utils/formatters/string';
import Button from 'components/Button';
import StructuredTab from 'components/StructuredTab';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import {
	ModalItemTitle as TxModalItemTitle,
	ModalItemText as TxModalItemText,
	NoTextTransform,
} from 'styles/common';
import GasSelector from 'components/GasSelector';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import useSynthetixQueries, {
	Action,
	APPROVE_CONTRACT_METHODS,
	GET_IS_APPROVED_CONTRACT_METHODS,
} from '@synthetixio/queries';
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
	const { connectWallet } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isAppReady = useRecoilValue(appReadyState);
	const address = useRecoilValue(walletAddressState);

	const { useGetDelegateWallets } = useSynthetixQueries();

	const delegateWalletsQuery = useGetDelegateWallets(address);
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
			if (!(properDelegateAddress && !delegateAddressIsSelf && isAppReady)) return null;
			const {
				contracts: { DelegateApprovals },
			} = synthetix.js!;
			return [
				DelegateApprovals,
				APPROVE_CONTRACT_METHODS.get(action),
				[properDelegateAddress, gas],
			];
		},
		[isAppReady, properDelegateAddress, action, delegateAddressIsSelf]
	);

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
						onTxConfirmed: () => {
							setTimeout(() => {
								delegateWalletsQuery.refetch();
							}, 10 * 1000);
						},
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
		const getIsAlreadyDelegated = async () => {
			if (!isAppReady) return;
			const {
				contracts: { DelegateApprovals },
			} = synthetix.js!;
			if (!(properDelegateAddress && action)) return setAlreadyDelegated(false);
			const alreadyDelegated = await DelegateApprovals[
				GET_IS_APPROVED_CONTRACT_METHODS.get(action)!
			](address, properDelegateAddress);
			setAlreadyDelegated(alreadyDelegated);
		};
		getIsAlreadyDelegated();
	}, [isAppReady, properDelegateAddress, address, action]);

	return (
		<div data-testid="form">
			<FormContainer>
				<InputsContainer>
					<AmountInput
						value={delegateAddress}
						placeholder={t('common.form.address-input-placeholder')}
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
